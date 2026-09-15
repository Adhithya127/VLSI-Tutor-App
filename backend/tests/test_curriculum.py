import pytest
import uuid
from httpx import AsyncClient

from app.core.database import Base
from app.models.module import Module, Lesson


async def create_test_data(db_session):
    mod1 = Module(
        id=str(uuid.uuid4()),
        title="Test Module 1",
        slug="test-module-1",
        subject="Electronics",
        order=1,
        milestone_id=1,
    )
    mod2 = Module(
        id=str(uuid.uuid4()),
        title="Test Module 2",
        slug="test-module-2",
        subject="Digital Logic",
        order=2,
        milestone_id=2,
    )
    db_session.add_all([mod1, mod2])
    await db_session.flush()

    lessons = [
        Lesson(id=str(uuid.uuid4()), module_id=mod1.id, title="Lesson 1A", slug="l1a", order=1),
        Lesson(id=str(uuid.uuid4()), module_id=mod1.id, title="Lesson 1B", slug="l1b", order=2),
        Lesson(id=str(uuid.uuid4()), module_id=mod2.id, title="Lesson 2A", slug="l2a", order=1),
    ]
    db_session.add_all(lessons)
    await db_session.commit()
    return mod1, mod2


async def get_auth_header(client: AsyncClient) -> dict:
    username = f"user_{uuid.uuid4().hex[:8]}"
    await client.post(
        "/api/v1/auth/register",
        json={"email": f"{username}@test.com", "username": username, "password": "testpass"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        data={"username": username, "password": "testpass"},
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.anyio
async def test_list_modules(client: AsyncClient):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as db:
        await create_test_data(db)

    headers = await get_auth_header(client)
    res = await client.get("/api/v1/curriculum/modules", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert data[0]["lesson_count"] == 2
    assert data[1]["lesson_count"] == 1


@pytest.mark.anyio
async def test_list_modules_by_milestone(client: AsyncClient):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as db:
        await create_test_data(db)

    headers = await get_auth_header(client)
    res = await client.get("/api/v1/curriculum/modules?milestone_id=1", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["subject"] == "Electronics"


@pytest.mark.anyio
async def test_get_module(client: AsyncClient):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as db:
        mod1, _ = await create_test_data(db)

    headers = await get_auth_header(client)
    res = await client.get(f"/api/v1/curriculum/modules/{mod1.id}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Test Module 1"
    assert len(data["lessons"]) == 2


@pytest.mark.anyio
async def test_get_module_not_found(client: AsyncClient):
    headers = await get_auth_header(client)
    res = await client.get("/api/v1/curriculum/modules/nonexistent", headers=headers)
    assert res.status_code == 404


@pytest.mark.anyio
async def test_get_lesson(client: AsyncClient):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as db:
        mod1, _ = await create_test_data(db)
        lesson_result = await db.execute(
            __import__("sqlalchemy").select(Lesson).where(Lesson.module_id == mod1.id).limit(1)
        )
        lesson = lesson_result.scalar_one()

    headers = await get_auth_header(client)
    res = await client.get(f"/api/v1/curriculum/lessons/{lesson.id}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Lesson 1A"


@pytest.mark.anyio
async def test_get_lesson_not_found(client: AsyncClient):
    headers = await get_auth_header(client)
    res = await client.get("/api/v1/curriculum/lessons/nonexistent", headers=headers)
    assert res.status_code == 404


@pytest.mark.anyio
async def test_list_milestones(client: AsyncClient):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as db:
        await create_test_data(db)

    headers = await get_auth_header(client)
    res = await client.get("/api/v1/curriculum/milestones", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    assert data[0]["id"] == 1
    assert data[0]["module_count"] == 1
    assert data[1]["id"] == 2
    assert data[1]["module_count"] == 1


@pytest.mark.anyio
async def test_unauthenticated_access(client: AsyncClient):
    res = await client.get("/api/v1/curriculum/modules")
    assert res.status_code == 401
