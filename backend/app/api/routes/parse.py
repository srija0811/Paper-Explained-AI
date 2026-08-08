import logging
from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.core.config import Settings, settings
from app.core.exceptions import PdfNotFoundError, PdfParseError
from app.schemas.parse import (
    ParseRequest,
    ParseSuccessResponse,
    ParseUnreadableResponse,
    FigureSchema,
    SectionSchema,
)
from app.services.parser import PDFParserService, ParseResult, UnreadableResult

logger = logging.getLogger(__name__)

router = APIRouter(tags=["parse"])


def get_settings() -> Settings:
    return settings


def get_parser_service(config: Settings = Depends(get_settings)) -> PDFParserService:
    return PDFParserService(config)


def _to_success_response(result: ParseResult) -> ParseSuccessResponse:
    return ParseSuccessResponse(
        title=result.title,
        authors=result.authors,
        sections=[
            SectionSchema(name=s.name, content=s.content, page_start=s.page_start)
            for s in result.sections
        ],
        figures=[
            FigureSchema(
                filename=f.filename,
                page=f.page,
                index=f.index,
                width=f.width,
                height=f.height,
            )
            for f in result.figures
        ],
        page_count=result.page_count,
    )


@router.post(
    "/parse",
    response_model=ParseSuccessResponse | ParseUnreadableResponse,
    responses={
        404: {"description": "Uploaded PDF not found"},
        500: {"description": "PDF parsing failed"},
    },
)
async def parse_pdf(
    body: ParseRequest,
    service: Annotated[PDFParserService, Depends(get_parser_service)],
) -> ParseSuccessResponse | ParseUnreadableResponse | JSONResponse:
    logger.info("Parse request received for filename=%s", body.filename)

    try:
        result = service.parse(body.filename)
    except PdfNotFoundError:
        raise
    except PdfParseError:
        raise
    except Exception:
        logger.exception("Unexpected parse failure for filename=%s", body.filename)
        raise PdfParseError("An unexpected error occurred while parsing the PDF.")

    if isinstance(result, UnreadableResult):
        logger.info(
            "PDF marked unreadable: filename=%s reason=%s",
            body.filename,
            result.reason,
        )
        return ParseUnreadableResponse(status=result.status, reason=result.reason)

    return _to_success_response(result)
