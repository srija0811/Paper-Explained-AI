import re
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import Settings
from app.core.exceptions import (
    EmptyFileError,
    FileTooLargeError,
    InvalidFileTypeError,
    UploadSaveError,
)

PDF_MAGIC = b"%PDF"


class UploadService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def save_pdf(self, file: UploadFile) -> str:
        original_name = self._sanitize_filename(file.filename or "document.pdf")
        self._validate_extension(original_name)
        self._validate_content_type(file.content_type)

        content = await file.read()
        self._validate_not_empty(content)
        self._validate_size(len(content))
        self._validate_pdf_magic(content)

        saved_name = self._unique_filename(original_name)
        destination = self._settings.upload_dir / saved_name

        try:
            self._settings.upload_dir.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(content)
        except OSError as exc:
            raise UploadSaveError() from exc

        return saved_name

    def _sanitize_filename(self, filename: str) -> str:
        name = Path(filename).name.strip()
        if not name:
            return "document.pdf"
        # Keep alphanumeric, dots, dashes, underscores; collapse the rest.
        safe = re.sub(r"[^\w.\-]", "_", name, flags=re.UNICODE)
        if not safe.lower().endswith(".pdf"):
            safe = f"{safe}.pdf"
        return safe

    def _validate_extension(self, filename: str) -> None:
        suffix = Path(filename).suffix.lower()
        if suffix not in self._settings.allowed_extensions:
            raise InvalidFileTypeError()

    def _validate_content_type(self, content_type: str | None) -> None:
        if content_type is None:
            return
        if content_type not in self._settings.allowed_content_types:
            raise InvalidFileTypeError()

    def _validate_not_empty(self, content: bytes) -> None:
        if not content:
            raise EmptyFileError()

    def _validate_size(self, size: int) -> None:
        if size > self._settings.max_upload_size_bytes:
            max_mb = self._settings.max_upload_size_bytes // (1024 * 1024)
            raise FileTooLargeError(max_mb)

    def _validate_pdf_magic(self, content: bytes) -> None:
        if not content.startswith(PDF_MAGIC):
            raise InvalidFileTypeError("File content is not a valid PDF.")

    def _unique_filename(self, filename: str) -> str:
        stem = Path(filename).stem
        suffix = Path(filename).suffix
        return f"{stem}_{uuid.uuid4().hex[:8]}{suffix}"
