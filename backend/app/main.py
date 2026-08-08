from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.routes import parse, upload
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging_config import setup_logging


def create_app() -> FastAPI:
    setup_logging(debug=settings.debug)

    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    register_exception_handlers(app)
    app.include_router(upload.router)
    app.include_router(parse.router)

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

