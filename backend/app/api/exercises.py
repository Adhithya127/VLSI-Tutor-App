from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.exercise import Exercise, ExerciseAttempt
from app.models.mastery import Mastery
from app.schemas.exercise import (
    ExerciseResponse,
    ExerciseSubmit,
    ExerciseResult,
)

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("/lesson/{lesson_id}", response_model=list[ExerciseResponse])
async def get_exercises_for_lesson(
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Exercise)
        .where(Exercise.lesson_id == lesson_id)
        .order_by(Exercise.difficulty, Exercise.id)
    )
    exercises = result.scalars().all()
    return exercises


@router.get("/lesson/{lesson_id}/stats")
async def get_lesson_exercise_stats(
    lesson_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_result = await db.execute(
        select(func.count(Exercise.id)).where(Exercise.lesson_id == lesson_id)
    )
    total = total_result.scalar() or 0

    attempted_result = await db.execute(
        select(func.count(func.distinct(ExerciseAttempt.exercise_id)))
        .join(Exercise, Exercise.id == ExerciseAttempt.exercise_id)
        .where(
            Exercise.lesson_id == lesson_id,
            ExerciseAttempt.user_id == current_user.id,
        )
    )
    attempted = attempted_result.scalar() or 0

    correct_result = await db.execute(
        select(func.count(ExerciseAttempt.id))
        .join(Exercise, Exercise.id == ExerciseAttempt.exercise_id)
        .where(
            Exercise.lesson_id == lesson_id,
            ExerciseAttempt.user_id == current_user.id,
            ExerciseAttempt.is_correct == True,
        )
    )
    correct = correct_result.scalar() or 0

    return {
        "total": total,
        "attempted": attempted,
        "correct": correct,
    }


@router.post("/{exercise_id}/submit", response_model=ExerciseResult)
async def submit_exercise(
    exercise_id: str,
    payload: ExerciseSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Exercise).where(Exercise.id == exercise_id)
    )
    exercise = result.scalar_one_or_none()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    is_correct = False
    if exercise.correct_answer:
        is_correct = payload.answer.strip().lower() == exercise.correct_answer.strip().lower()

    attempt = ExerciseAttempt(
        exercise_id=exercise_id,
        user_id=current_user.id,
        answer=payload.answer,
        is_correct=is_correct,
        time_seconds=payload.time_seconds,
    )
    db.add(attempt)
    await db.flush()
    await db.refresh(attempt)

    xp_earned = exercise.xp_reward if is_correct else 0

    if is_correct and exercise.concept_id:
        mastery_result = await db.execute(
            select(Mastery).where(
                Mastery.user_id == current_user.id,
                Mastery.concept_id == exercise.concept_id,
            )
        )
        mastery = mastery_result.scalar_one_or_none()
        if mastery:
            mastery.score = min(1.0, mastery.score + 0.05)
            mastery.attempts += 1
            mastery.correct += 1
        else:
            mastery = Mastery(
                user_id=current_user.id,
                concept_id=exercise.concept_id,
                score=0.05,
                confidence=0.1,
                attempts=1,
                correct=1,
            )
            db.add(mastery)

    total_xp_result = await db.execute(
        select(func.sum(Exercise.xp_reward))
        .join(ExerciseAttempt, ExerciseAttempt.exercise_id == Exercise.id)
        .where(
            ExerciseAttempt.user_id == current_user.id,
            ExerciseAttempt.is_correct == True,
        )
    )
    total_xp = total_xp_result.scalar() or 0

    await db.commit()

    return ExerciseResult(
        attempt_id=attempt.id,
        exercise_id=exercise_id,
        is_correct=is_correct,
        correct_answer=exercise.correct_answer,
        explanation=exercise.explanation,
        xp_earned=xp_earned,
        total_xp=total_xp,
    )


@router.get("/stats/overview")
async def get_exercise_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_exercises = await db.execute(select(func.count(Exercise.id)))
    total = total_exercises.scalar() or 0

    attempted_result = await db.execute(
        select(func.count(func.distinct(ExerciseAttempt.exercise_id)))
        .where(ExerciseAttempt.user_id == current_user.id)
    )
    attempted = attempted_result.scalar() or 0

    correct_result = await db.execute(
        select(func.count(ExerciseAttempt.id))
        .where(
            ExerciseAttempt.user_id == current_user.id,
            ExerciseAttempt.is_correct == True,
        )
    )
    correct = correct_result.scalar() or 0

    return {
        "total_exercises": total,
        "attempted": attempted,
        "correct": correct,
        "accuracy": round(correct / attempted * 100, 1) if attempted > 0 else 0,
    }
