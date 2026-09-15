"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-09-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, index=True),
        sa.Column("username", sa.String(100), unique=True, index=True),
        sa.Column("hashed_password", sa.String(255)),
        sa.Column("display_name", sa.String(200), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("is_superuser", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "concepts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(200), unique=True, index=True),
        sa.Column("slug", sa.String(200), unique=True, index=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("subject", sa.String(100), index=True),
        sa.Column("topic", sa.String(100), nullable=True),
        sa.Column("difficulty", sa.Integer, default=1),
        sa.Column("intuition", sa.Text, nullable=True),
        sa.Column("mathematical_explanation", sa.Text, nullable=True),
        sa.Column("physical_explanation", sa.Text, nullable=True),
        sa.Column("real_world_example", sa.Text, nullable=True),
        sa.Column("common_misconceptions", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "concept_prerequisites",
        sa.Column("concept_id", sa.String(36), primary_key=True),
        sa.Column("prerequisite_id", sa.String(36), primary_key=True),
        sa.Column("strength", sa.Float, default=1.0),
    )

    op.create_table(
        "modules",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(200)),
        sa.Column("slug", sa.String(200), index=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("subject", sa.String(100), index=True),
        sa.Column("order", sa.Integer, default=0),
        sa.Column("milestone_id", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "lessons",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("module_id", sa.String(36), index=True),
        sa.Column("title", sa.String(200)),
        sa.Column("slug", sa.String(200), index=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("content", sa.Text, nullable=True),
        sa.Column("duration_minutes", sa.Integer, default=15),
        sa.Column("order", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "exercises",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("concept_id", sa.String(36), nullable=True, index=True),
        sa.Column("lesson_id", sa.String(36), nullable=True, index=True),
        sa.Column("title", sa.String(200)),
        sa.Column("exercise_type", sa.String(50), index=True),
        sa.Column("difficulty", sa.Integer, default=1),
        sa.Column("question", sa.Text),
        sa.Column("options", sa.Text, nullable=True),
        sa.Column("correct_answer", sa.Text, nullable=True),
        sa.Column("explanation", sa.Text, nullable=True),
        sa.Column("xp_reward", sa.Integer, default=10),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "exercise_attempts",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("exercise_id", sa.String(36), index=True),
        sa.Column("user_id", sa.String(36), index=True),
        sa.Column("answer", sa.Text, nullable=True),
        sa.Column("is_correct", sa.Boolean, default=False),
        sa.Column("time_seconds", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "mastery",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), index=True),
        sa.Column("concept_id", sa.String(36), index=True),
        sa.Column("score", sa.Float, default=0.0),
        sa.Column("confidence", sa.Float, default=0.0),
        sa.Column("attempts", sa.Integer, default=0),
        sa.Column("correct", sa.Integer, default=0),
        sa.Column("last_reviewed", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_review", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "review_schedule",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), index=True),
        sa.Column("concept_id", sa.String(36), index=True),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), index=True),
        sa.Column("completed", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "resources",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(500)),
        sa.Column("author", sa.String(200), nullable=True),
        sa.Column("organization", sa.String(200), nullable=True),
        sa.Column("resource_type", sa.String(50), index=True),
        sa.Column("subject", sa.String(100), index=True),
        sa.Column("topic", sa.String(100), nullable=True),
        sa.Column("difficulty", sa.String(20), nullable=True),
        sa.Column("source_url", sa.Text, nullable=True),
        sa.Column("license", sa.String(100), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("authority_score", sa.Float, nullable=True),
        sa.Column("quality_score", sa.Float, nullable=True),
        sa.Column("drive_location", sa.Text, nullable=True),
        sa.Column("processing_status", sa.String(20), default="pending"),
        sa.Column("extraction_status", sa.String(20), default="pending"),
        sa.Column("indexing_status", sa.String(20), default="pending"),
        sa.Column("embedding_status", sa.String(20), default="pending"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "resource_chunks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("resource_id", sa.String(36), index=True),
        sa.Column("chunk_index", sa.Integer),
        sa.Column("content", sa.Text),
        sa.Column("content_hash", sa.String(64), nullable=True),
        sa.Column("metadata_json", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "embeddings",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("chunk_id", sa.String(36), index=True),
        sa.Column("content_type", sa.String(50), index=True),
        sa.Column("content_id", sa.String(36), index=True),
        sa.Column("text", sa.Text),
        sa.Column("vector", Vector(1536)),
        sa.Column("model_name", sa.String(100), default="text-embedding-3-small"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.execute(
        "CREATE INDEX ix_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops) WITH (lists = 100)"
    )


def downgrade() -> None:
    op.drop_table("embeddings")
    op.drop_table("resource_chunks")
    op.drop_table("resources")
    op.drop_table("review_schedule")
    op.drop_table("mastery")
    op.drop_table("exercise_attempts")
    op.drop_table("exercises")
    op.drop_table("lessons")
    op.drop_table("modules")
    op.drop_table("concept_prerequisites")
    op.drop_table("concepts")
    op.drop_table("users")
