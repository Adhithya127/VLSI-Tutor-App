from fastapi import APIRouter, Depends
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.module import Module, Lesson

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
async def search(
    q: str = "",
    db: AsyncSession = Depends(get_db),
):
    if not q.strip():
        return {"modules": [], "lessons": []}

    term = f"%{q}%"

    modules_result = await db.execute(
        select(Module).where(
            or_(
                Module.title.ilike(term),
                Module.description.ilike(term),
                Module.subject.ilike(term),
            )
        ).order_by(Module.order)
    )
    modules = modules_result.scalars().all()

    lessons_result = await db.execute(
        select(Lesson).where(
            or_(
                Lesson.title.ilike(term),
                Lesson.description.ilike(term),
                Lesson.content.ilike(term),
            )
        ).order_by(Lesson.order)
    )
    lessons = lessons_result.scalars().all()

    return {
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "subject": m.subject,
                "type": "module",
            }
            for m in modules
        ],
        "lessons": [
            {
                "id": l.id,
                "title": l.title,
                "description": l.description,
                "module_id": l.module_id,
                "type": "lesson",
            }
            for l in lessons
        ],
    }
