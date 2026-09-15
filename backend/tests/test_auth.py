import pytest


@pytest.mark.anyio
async def test_register_success(client):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "testuser",
            "password": "testpass123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "id" in data
    assert "hashed_password" not in data


@pytest.mark.anyio
async def test_register_duplicate_email(client):
    payload = {
        "email": "dup@example.com",
        "username": "user1",
        "password": "testpass123",
    }
    r1 = await client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201

    payload["username"] = "user2"
    r2 = await client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 409


@pytest.mark.anyio
async def test_login_success(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@example.com",
            "username": "loginuser",
            "password": "mypassword",
        },
    )
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "loginuser", "password": "mypassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.anyio
async def test_login_wrong_password(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrong@example.com",
            "username": "wronguser",
            "password": "correct",
        },
    )
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "wronguser", "password": "incorrect"},
    )
    assert response.status_code == 401


@pytest.mark.anyio
async def test_get_me(client):
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "me@example.com",
            "username": "meuser",
            "password": "mypassword",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        data={"username": "meuser", "password": "mypassword"},
    )
    token = login.json()["access_token"]

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "meuser"
    assert data["email"] == "me@example.com"


@pytest.mark.anyio
async def test_get_me_no_token(client):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
