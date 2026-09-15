from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "VLSI-Tutor"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+asyncpg://vlsi:vlsi@localhost:5432/vlsi_tutor"
    DATABASE_SYNC_URL: str = "postgresql+psycopg2://vlsi:vlsi@localhost:5432/vlsi_tutor"

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "https://frontend-seven-mu-qh1q0e6hfm.vercel.app",
    ]

    SECRET_KEY: str = "dev-secret-key-change-in-production"
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
