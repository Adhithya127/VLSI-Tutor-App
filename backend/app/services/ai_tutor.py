import json
import httpx
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.module import Lesson


SYSTEM_PROMPT = """You are VLSI Tutor, an expert AI tutor specializing in VLSI (Very Large Scale Integration) design and semiconductor engineering.

Your expertise covers:
- Digital logic design and Boolean algebra
- CMOS circuit design and transistor-level design
- ASIC/SOC design flow (RTL to GDSII)
- RTL design with Verilog/VHDL
- Static Timing Analysis (STA)
- Power analysis and low-power design
- Physical design (floorplanning, placement, CTS, routing)
- Design for Testability (DFT)
- Verification and UVM methodology
- FPGA design
- Electronics fundamentals (semiconductor physics, device modeling)

Teaching guidelines:
1. Explain concepts clearly with real-world analogies when helpful
2. Use mathematical formulations when they add clarity, but always explain the intuition first
3. When asked about specific topics, relate them to the broader VLSI design flow
4. If a student seems confused, try a different explanation approach
5. Encourage questions and deeper exploration
6. Be concise but thorough — avoid unnecessary padding
7. Use bullet points and structured formatting for readability

When relevant lesson content is provided below, use it as context for your answers. The content comes from the VLSI-Tutor curriculum. Reference it naturally in your explanations without saying 'according to the lesson.'"""


def build_lesson_context(lessons: list[Lesson]) -> str:
    if not lessons:
        return ""
    parts = ["Relevant curriculum content for reference:\n"]
    for lesson in lessons:
        content_preview = (lesson.content or "")[:1500]
        parts.append(f"--- {lesson.title} ---\n{content_preview}\n")
    return "\n".join(parts)


async def search_relevant_lessons(
    db: AsyncSession, query: str, limit: int = 3
) -> list[Lesson]:
    keywords = [
        word for word in query.lower().split()
        if len(word) > 3 and word not in {
            "what", "does", "this", "that", "with", "from", "have",
            "been", "were", "they", "their", "about", "would", "could",
            "should", "there", "your", "which", "where", "when", "some",
            "more", "also", "into", "than", "then", "them", "each",
            "just", "over", "such", "take", "only", "very", "well",
        }
    ]
    if not keywords:
        return []

    conditions = []
    for kw in keywords[:5]:
        pattern = f"%{kw}%"
        conditions.append(or_(
            Lesson.title.ilike(pattern),
            Lesson.description.ilike(pattern),
            Lesson.content.ilike(pattern),
        ))

    result = await db.execute(
        select(Lesson).where(or_(*conditions)).limit(limit)
    )
    return list(result.scalars().all())


async def stream_gemini_response(
    messages: list[dict], system_prompt: str
):
    if not settings.GOOGLE_API_KEY:
        yield json.dumps({"error": "Google API key not configured"}) + "\n"
        return

    contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})

    if contents and contents[-1]["role"] == "user":
        pass
    else:
        contents.append({"role": "user", "parts": [{"text": "Can you help me?"}]})

    full_system = system_prompt
    if messages and messages[0].get("lesson_context"):
        full_system += "\n\n" + messages[0]["lesson_context"]

    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": full_system}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
        },
    }

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-3.5-flash:streamGenerateContent?"
        f"alt=sse&key={settings.GOOGLE_API_KEY}"
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            async with client.stream(
                "POST", url, json=payload
            ) as response:
                if response.status_code != 200:
                    error_body = ""
                    async for chunk in response.aiter_text():
                        error_body += chunk
                    yield json.dumps({
                        "error": f"Gemini API error ({response.status_code}): {error_body[:200]}"
                    }) + "\n"
                    return

                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:].strip()
                        if not data:
                            continue
                        try:
                            parsed = json.loads(data)
                            candidates = parsed.get("candidates", [])
                            if candidates:
                                parts = (
                                    candidates[0]
                                    .get("content", {})
                                    .get("parts", [])
                                )
                                for part in parts:
                                    text = part.get("text", "")
                                    if text:
                                        yield json.dumps({"text": text}) + "\n"
                        except json.JSONDecodeError:
                            continue
        except httpx.TimeoutException:
            yield json.dumps({"error": "Request timed out"}) + "\n"
        except httpx.ConnectError:
            yield json.dumps({"error": "Could not connect to Gemini API"}) + "\n"
        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"

    yield json.dumps({"done": True}) + "\n"
