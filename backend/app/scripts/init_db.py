"""Initialize the database: create tables and pgvector extension."""
import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.database import Base
from app.models import *  # noqa: F401, F403


async def init_db():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)

    await engine.dispose()
    print("Database initialized successfully.")


if __name__ == "__main__":
    asyncio.run(init_db())
