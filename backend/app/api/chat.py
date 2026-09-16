from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat import Conversation, Message
from app.models.module import Lesson
from app.schemas.chat import (
    ConversationCreate,
    ConversationResponse,
    MessageResponse,
    ChatRequest,
)
from app.services.ai_tutor import (
    SYSTEM_PROMPT,
    build_lesson_context,
    search_relevant_lessons,
    stream_gemini_response,
)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    payload: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = Conversation(
        user_id=current_user.id,
        title=payload.title or "New Conversation",
    )
    db.add(conv)
    await db.flush()
    await db.refresh(conv)
    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at.isoformat(),
        message_count=0,
    )


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.created_at.desc())
    )
    conversations = result.scalars().all()

    responses = []
    for conv in conversations:
        count_result = await db.execute(
            select(func.count(Message.id)).where(
                Message.conversation_id == conv.id
            )
        )
        message_count = count_result.scalar() or 0
        responses.append(
            ConversationResponse(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at.isoformat(),
                message_count=message_count,
            )
        )
    return responses


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
async def get_messages(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()
    return [
        MessageResponse(
            id=m.id,
            role=m.role,
            content=m.content,
            created_at=m.created_at.isoformat(),
        )
        for m in messages
    ]


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=payload.content,
    )
    db.add(user_message)

    count_result = await db.execute(
        select(func.count(Message.id)).where(
            Message.conversation_id == conversation_id
        )
    )
    message_count = count_result.scalar() or 0
    if message_count == 0:
        title = payload.content[:80]
        if len(payload.content) > 80:
            title += "..."
        conv.title = title

    await db.commit()

    lessons = []
    if payload.lesson_id:
        lesson_result = await db.execute(
            select(Lesson).where(Lesson.id == payload.lesson_id)
        )
        lesson = lesson_result.scalar_one_or_none()
        if lesson:
            lessons.append(lesson)

    if not lessons:
        lessons = await search_relevant_lessons(db, payload.content)

    lesson_context = build_lesson_context(lessons)

    history_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .limit(20)
    )
    history = history_result.scalars().all()

    messages_for_ai = []
    if lesson_context:
        messages_for_ai.append({
            "role": "system",
            "content": payload.content,
            "lesson_context": lesson_context,
        })
    for m in history:
        messages_for_ai.append({"role": m.role, "content": m.content})

    full_response = []
    conv_id = conversation_id

    async def generate():
        async for chunk in stream_gemini_response(messages_for_ai, SYSTEM_PROMPT):
            yield chunk
            try:
                import json as _json
                data = _json.loads(chunk.strip())
                if "text" in data:
                    full_response.append(data["text"])
            except Exception:
                pass

        if full_response:
            assistant_content = "".join(full_response)
            from app.core.database import async_session

            async with async_session() as save_db:
                assistant_msg = Message(
                    conversation_id=conv_id,
                    role="assistant",
                    content=assistant_content,
                )
                save_db.add(assistant_msg)
                await save_db.commit()

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
