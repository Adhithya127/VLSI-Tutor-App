from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.mastery import Mastery, ReviewSchedule
from app.models.exercise import ExerciseAttempt

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    mastery_result = await db.execute(
        select(
            func.count(Mastery.id).label("total_concepts"),
            func.coalesce(func.sum(Mastery.score), 0).label("total_score"),
            func.coalesce(func.max(Mastery.score), 0).label("max_score"),
        ).where(Mastery.user_id == current_user.id)
    )
    mastery_row = mastery_result.one()

    attempt_result = await db.execute(
        select(
            func.count(ExerciseAttempt.id).label("total_attempts"),
            func.coalesce(
                func.sum(func.cast(ExerciseAttempt.is_correct, type_=func.count().type)),
                0,
            ).label("correct_attempts"),
        ).where(ExerciseAttempt.user_id == current_user.id)
    )
    attempt_row = attempt_result.one()

    review_result = await db.execute(
        select(func.count(ReviewSchedule.id))
        .where(ReviewSchedule.user_id == current_user.id)
        .where(ReviewSchedule.completed == False)
        .where(ReviewSchedule.scheduled_at <= now)
    )
    pending_reviews = review_result.scalar() or 0

    xp = int(mastery_row.total_score * 10) + int(attempt_row.total_attempts * 5)
    level = min(xp // 100 + 1, 100)
    xp_in_level = xp % 100

    mastered = mastery_result.scalar_one()
    total_concepts = 248

    return {
        "xp": xp,
        "level": level,
        "xp_in_level": xp_in_level,
        "concepts_mastered": int(mastery_row.total_score),
        "total_concepts": total_concepts,
        "total_attempts": attempt_row.total_attempts,
        "correct_attempts": attempt_row.correct_attempts,
        "pending_reviews": pending_reviews,
    }
