from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Paper Pal AI API"
    debug: bool = False

    upload_dir: Path = Path(__file__).resolve().parents[2] / "uploads"
    images_dir: Path = Path(__file__).resolve().parents[2] / "uploads" / "images"
    max_upload_size_bytes: int = 40 * 1024 * 1024  # 40 MB
    allowed_content_types: frozenset[str] = frozenset({"application/pdf"})
    allowed_extensions: frozenset[str] = frozenset({".pdf"})

    # Parser thresholds
    scanned_min_total_chars: int = 120
    scanned_min_avg_chars_per_page: float = 30.0
    scanned_min_text_page_ratio: float = 0.25
    mojibake_threshold: float = 0.20


settings = Settings()
