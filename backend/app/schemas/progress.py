from pydantic import BaseModel


class LessonProgressResponse(BaseModel):
    lesson_id: str
    completed: bool
    score: float
    time_spent_minutes: int
    completed_at: str | None = None

    model_config = {"from_attributes": True}


class ProgressOverview(BaseModel):
    total_lessons: int
    completed_lessons: int
    total_modules: int
    completed_modules: int
    total_exercises: int
    correct_exercises: int
    accuracy: float
    total_xp: int
    level: int
    xp_in_level: int
    streak_days: int
