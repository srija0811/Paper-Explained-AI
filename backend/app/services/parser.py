import logging
import re
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import pymupdf as fitz

from app.core.config import Settings
from app.core.exceptions import PdfNotFoundError, PdfParseError

logger = logging.getLogger(__name__)

# Section headings commonly found in academic papers (case-insensitive).
SECTION_PATTERNS: dict[str, re.Pattern[str]] = {
    "abstract": re.compile(r"^\s*abstract\s*$", re.IGNORECASE | re.MULTILINE),
    "introduction": re.compile(
        r"^\s*(?:\d+\.?\s*)?introduction\s*$",
        re.IGNORECASE | re.MULTILINE,
    ),
    "methodology": re.compile(
        r"^\s*(?:\d+\.?\s*)?(?:methodology|methods?|materials?\s+and\s+methods?)\s*$",
        re.IGNORECASE | re.MULTILINE,
    ),
    "results": re.compile(
        r"^\s*(?:\d+\.?\s*)?(?:results?|findings?|experiments?)\s*$",
        re.IGNORECASE | re.MULTILINE,
    ),
    "conclusion": re.compile(
        r"^\s*(?:\d+\.?\s*)?(?:conclusion|conclusions?|concluding\s+remarks?)\s*$",
        re.IGNORECASE | re.MULTILINE,
    ),
    "limitations": re.compile(
        r"^\s*(?:\d+\.?\s*)?(?:limitations?|future\s+work|discussion)\s*$",
        re.IGNORECASE | re.MULTILINE,
    ),
}

SECTION_ORDER = (
    "abstract",
    "introduction",
    "methodology",
    "results",
    "conclusion",
    "limitations",
)

MOJIBAKE_MARKERS = re.compile(r"[ÃÂâ�]|ï»¿|Ã©|Ã¨|Ã¼|â€™|â€œ|â€")

# Control chars except common whitespace.
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]")


@dataclass
class FigureRecord:
    filename: str
    page: int
    index: int
    width: int
    height: int


@dataclass
class SectionRecord:
    name: str
    content: str
    page_start: int | None = None


@dataclass
class ParseResult:
    title: str = ""
    authors: str = ""
    sections: list[SectionRecord] = field(default_factory=list)
    figures: list[FigureRecord] = field(default_factory=list)
    page_count: int = 0


@dataclass
class UnreadableResult:
    status: str = "unreadable"
    reason: str = ""


class PDFParserService:
    """Extracts structured content and figures from uploaded research PDFs."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._images_dir = settings.images_dir

    def parse(self, filename: str) -> ParseResult | UnreadableResult:
        pdf_path = self._resolve_pdf_path(filename)
        logger.info("Starting PDF parse: %s", pdf_path.name)

        try:
            doc = fitz.open(pdf_path)
        except Exception as exc:
            logger.exception("Failed to open PDF: %s", pdf_path)
            raise PdfParseError(f"Unable to open PDF: {pdf_path.name}") from exc

        try:
            page_count = doc.page_count
            if page_count == 0:
                logger.warning("PDF has no pages: %s", pdf_path.name)
                return UnreadableResult(reason="Scanned PDF")

            page_texts = self._extract_page_texts(doc)
            full_text = "\n\n".join(page_texts)

            if self._is_scanned(page_texts, page_count):
                logger.warning("Scanned PDF detected: %s", pdf_path.name)
                return UnreadableResult(reason="Scanned PDF")

            if self._has_mojibake(full_text):
                logger.warning("Corrupted text detected: %s", pdf_path.name)
                return UnreadableResult(reason="Corrupted text")

            title, authors = self._extract_title_and_authors(doc, page_texts)
            semantic_sections = self._extract_semantic_sections(full_text)
            page_sections = [
                SectionRecord(name=f"page_{index + 1}", content=text, page_start=index + 1)
                for index, text in enumerate(page_texts)
            ]
            figures = self._extract_images(doc, pdf_path.stem)

            sections = self._merge_sections(semantic_sections, page_sections)

            result = ParseResult(
                title=title,
                authors=authors,
                sections=sections,
                figures=figures,
                page_count=page_count,
            )
            logger.info(
                "Parse complete: %s — %d pages, %d sections, %d figures",
                pdf_path.name,
                page_count,
                len(sections),
                len(figures),
            )
            return result
        finally:
            doc.close()

    def _resolve_pdf_path(self, filename: str) -> Path:
        safe_name = Path(filename).name
        if not safe_name or safe_name != filename:
            raise PdfNotFoundError("Invalid filename.")
        if safe_name.startswith(".") or ".." in safe_name:
            raise PdfNotFoundError("Invalid filename.")

        pdf_path = self._settings.upload_dir / safe_name
        if not pdf_path.is_file():
            logger.error("PDF not found: %s", pdf_path)
            raise PdfNotFoundError(f"PDF not found: {safe_name}")
        return pdf_path

    def _extract_page_texts(self, doc: fitz.Document) -> list[str]:
        texts: list[str] = []
        for page in doc:
            text = page.get_text("text").strip()
            texts.append(text)
        return texts

    def _is_scanned(self, page_texts: list[str], page_count: int) -> bool:
        total_chars = sum(len(text) for text in page_texts)
        avg_chars = total_chars / page_count
        non_empty_pages = sum(1 for text in page_texts if len(text.strip()) >= 20)

        # Almost no selectable text across the document.
        if total_chars < self._settings.scanned_min_total_chars:
            return True
        if avg_chars < self._settings.scanned_min_avg_chars_per_page:
            return True
        if non_empty_pages / page_count < self._settings.scanned_min_text_page_ratio:
            return True
        return False

    def _has_mojibake(self, text: str) -> bool:
        if not text:
            return False
        corrupted = 0
        for ch in text:
            if self._is_corrupted_char(ch):
                corrupted += 1
        ratio = corrupted / len(text)
        if ratio > self._settings.mojibake_threshold:
            return True
        # Secondary signal: frequent mojibake byte-sequence artifacts.
        marker_hits = len(MOJIBAKE_MARKERS.findall(text))
        if marker_hits >= 5 and marker_hits / max(len(text) / 100, 1) > 2:
            return True
        return False

    @staticmethod
    def _is_corrupted_char(ch: str) -> bool:
        if ch == "\ufffd":
            return True
        if _CONTROL_CHARS.match(ch):
            return True
        category = unicodedata.category(ch)
        if category in {"Cs", "Cn"}:  # surrogate / unassigned
            return True
        return False

    def _extract_title_and_authors(
        self,
        doc: fitz.Document,
        page_texts: list[str],
    ) -> tuple[str, str]:
        first_page = doc[0]
        blocks = self._get_text_blocks(first_page)

        title = ""
        authors = ""

        if blocks:
            # Title: largest font size near top of page.
            top_blocks = [b for b in blocks if b["y0"] < first_page.rect.height * 0.45]
            if top_blocks:
                title_block = max(top_blocks, key=lambda b: (b["size"], -b["y0"]))
                title = self._normalize_whitespace(title_block["text"])

            # Authors: blocks immediately below title, smaller font.
            if title:
                title_y = next((b["y0"] for b in top_blocks if b["text"].strip() == title.strip()), None)
                if title_y is not None:
                    author_blocks = [
                        b
                        for b in top_blocks
                        if b["y0"] > title_y
                        and b["size"] <= title_block["size"]
                        and b["y0"] < first_page.rect.height * 0.55
                    ]
                    author_blocks.sort(key=lambda b: b["y0"])
                    author_lines = [b["text"].strip() for b in author_blocks[:4] if b["text"].strip()]
                    authors = self._normalize_whitespace(" ".join(author_lines))

        # Fallback: parse first page plain text before "Abstract".
        if not title and page_texts:
            first_text = page_texts[0]
            abstract_split = re.split(r"\babstract\b", first_text, maxsplit=1, flags=re.IGNORECASE)
            header = abstract_split[0].strip()
            lines = [line.strip() for line in header.splitlines() if line.strip()]
            if lines:
                title = lines[0]
            if len(lines) > 1:
                authors = self._normalize_whitespace(" ".join(lines[1:4]))

        return title, authors

    @staticmethod
    def _get_text_blocks(page: fitz.Page) -> list[dict[str, Any]]:
        blocks: list[dict[str, Any]] = []
        payload = page.get_text("dict")
        for block in payload.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                if not spans:
                    continue
                text = "".join(span.get("text", "") for span in spans).strip()
                if not text:
                    continue
                size = max(float(span.get("size", 0)) for span in spans)
                bbox = line.get("bbox", (0, 0, 0, 0))
                blocks.append({"text": text, "size": size, "y0": bbox[1], "y1": bbox[3]})
        return blocks

    def _extract_semantic_sections(self, full_text: str) -> list[SectionRecord]:
        matches: list[tuple[int, str, re.Match[str]]] = []
        for name, pattern in SECTION_PATTERNS.items():
            for match in pattern.finditer(full_text):
                matches.append((match.start(), name, match))

        matches.sort(key=lambda item: item[0])

        # Deduplicate: keep first occurrence of each section name.
        seen: set[str] = set()
        unique_matches: list[tuple[int, str, re.Match[str]]] = []
        for item in matches:
            if item[1] in seen:
                continue
            seen.add(item[1])
            unique_matches.append(item)

        sections: list[SectionRecord] = []
        for index, (start, name, match) in enumerate(unique_matches):
            content_start = match.end()
            content_end = unique_matches[index + 1][0] if index + 1 < len(unique_matches) else len(full_text)
            content = self._normalize_whitespace(full_text[content_start:content_end])
            if content:
                sections.append(SectionRecord(name=name, content=content))

        # Ensure all expected keys exist (empty when not found).
        existing = {section.name for section in sections}
        for name in SECTION_ORDER:
            if name not in existing:
                sections.append(SectionRecord(name=name, content=""))

        sections.sort(key=lambda s: SECTION_ORDER.index(s.name) if s.name in SECTION_ORDER else 99)
        return sections

    def _extract_images(self, doc: fitz.Document, pdf_stem: str) -> list[FigureRecord]:
        self._images_dir.mkdir(parents=True, exist_ok=True)
        figures: list[FigureRecord] = []
        seen_xrefs: set[int] = set()

        for page_index in range(doc.page_count):
            page = doc[page_index]
            image_list = page.get_images(full=True)
            for img_index, image_info in enumerate(image_list):
                xref = int(image_info[0])
                if xref in seen_xrefs:
                    continue
                seen_xrefs.add(xref)

                try:
                    extracted = doc.extract_image(xref)
                except Exception:
                    logger.warning(
                        "Skipping image xref=%s on page %d of %s",
                        xref,
                        page_index + 1,
                        pdf_stem,
                    )
                    continue

                image_bytes = extracted.get("image")
                if not image_bytes:
                    continue

                ext = extracted.get("ext", "png")
                if ext == "jpeg":
                    ext = "jpg"

                filename = f"{pdf_stem}_p{page_index + 1}_img{img_index}.{ext}"
                destination = self._images_dir / filename
                try:
                    destination.write_bytes(image_bytes)
                except OSError:
                    logger.exception("Failed to write image: %s", destination)
                    raise PdfParseError(f"Failed to save extracted image: {filename}")

                figures.append(
                    FigureRecord(
                        filename=filename,
                        page=page_index + 1,
                        index=img_index,
                        width=int(extracted.get("width", 0)),
                        height=int(extracted.get("height", 0)),
                    )
                )

        logger.info("Extracted %d images for %s", len(figures), pdf_stem)
        return figures

    @staticmethod
    def _merge_sections(
        semantic: list[SectionRecord],
        pages: list[SectionRecord],
    ) -> list[SectionRecord]:
        """Semantic sections first, then per-page text blocks."""
        return semantic + pages

    @staticmethod
    def _normalize_whitespace(text: str) -> str:
        return re.sub(r"\s+", " ", text).strip()
