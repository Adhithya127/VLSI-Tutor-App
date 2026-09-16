from pydantic import BaseModel


class ExerciseBase(BaseModel):
    title: str
    exercise_type: str
    difficulty: int = 1
    question: str
    options: str | None = None
    correct_answer: str | None = None
    explanation: str | None = None
    xp_reward: int = 10


class ExerciseResponse(ExerciseBase):
    id: str
    lesson_id: str | None = None
    concept_id: str | None = None

    model_config = {"from_attributes": True}


class ExerciseSubmit(BaseModel):
    answer: str
    time_seconds: float | None = None


class ExerciseResult(BaseModel):
    attempt_id: str
    exercise_id: str
    is_correct: bool
    correct_answer: str | None = None
    explanation: str | None = None
    xp_earned: int
    total_xp: int
