import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Text, Integer, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Concept(Base):
    __tablename__ = "concepts"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    subject: Mapped[str] = mapped_column(String(100), index=True)
    topic: Mapped[str | None] = mapped_column(String(100), nullable=True)
    difficulty: Mapped[int] = mapped_column(Integer, default=1)
    intuition: Mapped[str | None] = mapped_column(Text, nullable=True)
    mathematical_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    physical_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    real_world_example: Mapped[str | None] = mapped_column(Text, nullable=True)
    common_misconceptions: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    prerequisites: Mapped[list["ConceptPrerequisite"]] = relationship(
        back_populates="concept",
        primaryjoin="Concept.id == ConceptPrerequisite.concept_id",
    )
    dependents: Mapped[list["ConceptPrerequisite"]] = relationship(
        back_populates="prerequisite",
        primaryjoin="Concept.id == ConceptPrerequisite.prerequisite_id",
    )


class ConceptPrerequisite(Base):
    __tablename__ = "concept_prerequisites"

    concept_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concepts.id"), primary_key=True
    )
    prerequisite_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("concepts.id"), primary_key=True
    )
    strength: Mapped[float] = mapped_column(Float, default=1.0)

    concept: Mapped["Concept"] = relationship(
        back_populates="prerequisites", foreign_keys=[concept_id]
    )
    prerequisite: Mapped["Concept"] = relationship(
        back_populates="dependents", foreign_keys=[prerequisite_id]
    )
