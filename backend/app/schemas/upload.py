from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    status: str = Field(..., examples=["success"])
    filename: str = Field(..., examples=["research-paper.pdf"])
    message: str = Field(..., examples=["PDF uploaded successfully."])
