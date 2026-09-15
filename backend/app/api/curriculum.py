from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.module import Module, Lesson
from app.schemas.module import ModuleResponse, ModuleSummary, LessonResponse

router = APIRouter(prefix="/curriculum", tags=["curriculum"])


@router.get("/modules", response_model=list[ModuleSummary])
async def list_modules(
    milestone_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = select(Module).order_by(Module.order)
    if milestone_id is not None:
        query = query.where(Module.milestone_id == milestone_id)

    result = await db.execute(query)
    modules = result.scalars().all()

    summaries = []
    for mod in modules:
        count_result = await db.execute(
            select(func.count(Lesson.id)).where(Lesson.module_id == mod.id)
        )
        lesson_count = count_result.scalar() or 0
        summaries.append(
            ModuleSummary(
                id=mod.id,
                title=mod.title,
                slug=mod.slug,
                description=mod.description,
                subject=mod.subject,
                order=mod.order,
                milestone_id=mod.milestone_id,
                lesson_count=lesson_count,
            )
        )
    return summaries


@router.get("/modules/{module_id}", response_model=ModuleResponse)
async def get_module(
    module_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Module)
        .options(selectinload(Module.lessons))
        .where(Module.id == module_id)
    )
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.get("/lessons/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.get("/milestones")
async def list_milestones(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Module.milestone_id, func.count(Module.id))
        .where(Module.milestone_id.isnot(None))
        .group_by(Module.milestone_id)
        .order_by(Module.milestone_id)
    )
    rows = result.all()
    return [{"id": r[0], "module_count": r[1]} for r in rows]
