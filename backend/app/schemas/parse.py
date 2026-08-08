from pydantic import BaseModel, Field


class ParseRequest(BaseModel):
    filename: str = Field(..., min_length=1, examples=["research-paper_a1b2c3d4.pdf"])


class SectionSchema(BaseModel):
    name: str
    content: str
    page_start: int | None = None


class FigureSchema(BaseModel):
    filename: str
    page: int
    index: int
    width: int = 0
    height: int = 0


class ParseSuccessResponse(BaseModel):
    title: str = ""
    authors: str = ""
    sections: list[SectionSchema] = Field(default_factory=list)
    figures: list[FigureSchema] = Field(default_factory=list)
    page_count: int = 0


class ParseUnreadableResponse(BaseModel):
    status: str = "unreadable"
    reason: str
