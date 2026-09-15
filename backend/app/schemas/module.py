from pydantic import BaseModel


class LessonBase(BaseModel):
    title: str
    slug: str
    description: str | None = None
    duration_minutes: int = 15
    order: int = 0


class LessonResponse(LessonBase):
    id: str
    module_id: str

    model_config = {"from_attributes": True}


class ModuleBase(BaseModel):
    title: str
    slug: str
    description: str | None = None
    subject: str
    order: int = 0
    milestone_id: int | None = None


class ModuleResponse(ModuleBase):
    id: str
    lessons: list[LessonResponse] = []

    model_config = {"from_attributes": True}


class ModuleSummary(BaseModel):
    id: str
    title: str
    slug: str
    description: str | None = None
    subject: str
    order: int
    milestone_id: int | None = None
    lesson_count: int = 0

    model_config = {"from_attributes": True}
