import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class Embedding(Base):
    __tablename__ = "embeddings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    chunk_id: Mapped[str] = mapped_column(String(36), index=True)
    content_type: Mapped[str] = mapped_column(String(50), index=True)
    content_id: Mapped[str] = mapped_column(String(36), index=True)
    text: Mapped[str] = mapped_column(Text)
    vector: Mapped[list[float]] = mapped_column(Vector(1536))
    model_name: Mapped[str] = mapped_column(String(100), default="text-embedding-3-small")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
