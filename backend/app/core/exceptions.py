from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base application error with an HTTP status code and message."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class InvalidFileTypeError(AppError):
    def __init__(self, message: str = "Only PDF files are allowed.") -> None:
        super().__init__(message=message, status_code=415)


class FileTooLargeError(AppError):
    def __init__(self, max_size_mb: int) -> None:
        super().__init__(
            message=f"File exceeds the maximum allowed size of {max_size_mb} MB.",
            status_code=413,
        )


class EmptyFileError(AppError):
    def __init__(self) -> None:
        super().__init__(message="Uploaded file is empty.", status_code=400)


class UploadSaveError(AppError):
    def __init__(self, message: str = "Failed to save uploaded file.") -> None:
        super().__init__(message=message, status_code=500)


class PdfNotFoundError(AppError):
    def __init__(self, message: str = "PDF not found.") -> None:
        super().__init__(message=message, status_code=404)


class PdfParseError(AppError):
    def __init__(self, message: str = "Failed to parse PDF.") -> None:
        super().__init__(message=message, status_code=500)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"status": "error", "detail": exc.message},
        )
