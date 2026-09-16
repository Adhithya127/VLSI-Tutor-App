from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.progress import LessonProgress
from app.models.module import Module, Lesson
from app.models.exercise import Exercise, ExerciseAttempt
from app.schemas.progress import LessonProgressResponse, ProgressOverview

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/lessons/{lesson_id}/complete")
async def mark_lesson_complete(
    lesson_id: str,
    score: float = 1.0,
    time_spent_minutes: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson_check = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id)
    )
    if not lesson_check.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Lesson not found")

    result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    progress = result.scalar_one_or_none()

    if progress:
        progress.completed = True
        progress.score = max(progress.score, score)
        progress.time_spent_minutes = max(progress.time_spent_minutes, time_spent_minutes)
        progress.completed_at = datetime.now(timezone.utc)
    else:
        progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            completed=True,
            score=score,
            time_spent_minutes=time_spent_minutes,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(progress)

    await db.commit()
    return {"status": "completed", "lesson_id": lesson_id}


@router.get("/lessons", response_model=list[LessonProgressResponse])
async def get_lesson_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(LessonProgress)
        .where(LessonProgress.user_id == current_user.id)
        .order_by(LessonProgress.updated_at.desc())
    )
    progress_list = result.scalars().all()
    return [
        LessonProgressResponse(
            lesson_id=p.lesson_id,
            completed=p.completed,
            score=p.score,
            time_spent_minutes=p.time_spent_minutes,
            completed_at=p.completed_at.isoformat() if p.completed_at else None,
        )
        for p in progress_list
    ]


@router.get("/lessons/{lesson_id}")
async def get_single_lesson_progress(
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    progress = result.scalar_one_or_none()
    if not progress:
        return {"lesson_id": lesson_id, "completed": False, "score": 0.0}
    return {
        "lesson_id": progress.lesson_id,
        "completed": progress.completed,
        "score": progress.score,
        "time_spent_minutes": progress.time_spent_minutes,
        "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
    }


@router.get("/overview", response_model=ProgressOverview)
async def get_progress_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_lessons_result = await db.execute(select(func.count(Lesson.id)))
    total_lessons = total_lessons_result.scalar() or 0

    completed_lessons_result = await db.execute(
        select(func.count(LessonProgress.id)).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.completed == True,
        )
    )
    completed_lessons = completed_lessons_result.scalar() or 0

    total_modules_result = await db.execute(select(func.count(Module.id)))
    total_modules = total_modules_result.scalar() or 0

    completed_modules_result = await db.execute(
        select(func.count(func.distinct(Module.id)))
        .join(Lesson, Lesson.module_id == Module.id)
        .join(LessonProgress, LessonProgress.lesson_id == Lesson.id)
        .where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.completed == True,
        )
    )
    completed_modules = completed_modules_result.scalar() or 0

    total_exercises_result = await db.execute(select(func.count(Exercise.id)))
    total_exercises = total_exercises_result.scalar() or 0

    correct_result = await db.execute(
        select(func.count(ExerciseAttempt.id)).where(
            ExerciseAttempt.user_id == current_user.id,
            ExerciseAttempt.is_correct == True,
        )
    )
    correct_exercises = correct_result.scalar() or 0

    total_attempts_result = await db.execute(
        select(func.count(ExerciseAttempt.id)).where(
            ExerciseAttempt.user_id == current_user.id,
        )
    )
    total_attempts = total_attempts_result.scalar() or 0

    xp_result = await db.execute(
        select(func.sum(Exercise.xp_reward))
        .join(ExerciseAttempt, ExerciseAttempt.exercise_id == Exercise.id)
        .where(
            ExerciseAttempt.user_id == current_user.id,
            ExerciseAttempt.is_correct == True,
        )
    )
    total_xp = xp_result.scalar() or 0

    lesson_xp_result = await db.execute(
        select(func.count(LessonProgress.id)).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.completed == True,
        )
    )
    lesson_xp = (lesson_xp_result.scalar() or 0) * 20
    total_xp += lesson_xp

    level = min(100, total_xp // 100 + 1)
    xp_in_level = total_xp % 100

    return ProgressOverview(
        total_lessons=total_lessons,
        completed_lessons=completed_lessons,
        total_modules=total_modules,
        completed_modules=completed_modules,
        total_exercises=total_exercises,
        correct_exercises=correct_exercises,
        accuracy=round(correct_exercises / total_attempts * 100, 1) if total_attempts > 0 else 0,
        total_xp=total_xp,
        level=level,
        xp_in_level=xp_in_level,
        streak_days=0,
    )
