from fastapi import APIRouter, Depends, File, UploadFile

from app.core.config import Settings, settings
from app.schemas.upload import UploadResponse
from app.services.upload_service import UploadService

router = APIRouter(tags=["upload"])


def get_settings() -> Settings:
    return settings


def get_upload_service(config: Settings = Depends(get_settings)) -> UploadService:
    return UploadService(config)


@router.post("/upload", response_model=UploadResponse, status_code=201)
async def upload_pdf(
    file: UploadFile = File(..., description="Research paper PDF (max 40 MB)"),
    service: UploadService = Depends(get_upload_service),
) -> UploadResponse:
    saved_filename = await service.save_pdf(file)
    return UploadResponse(
        status="success",
        filename=saved_filename,
        message="PDF uploaded successfully.",
    )
