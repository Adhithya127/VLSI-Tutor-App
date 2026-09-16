import asyncio
import json
import uuid
from app.core.database import async_session, engine, Base
from app.models.exercise import Exercise
from app.models.module import Lesson
from sqlalchemy import select, text


EXERCISES = [
    {
        "lesson_slug": "cmos-inverter-fundamentals",
        "title": "CMOS Inverter Basics",
        "exercise_type": "multiple_choice",
        "difficulty": 1,
        "question": "What does CMOS stand for?",
        "options": json.dumps(["Complementary Metal-Oxide-Semiconductor", "Common Metal-Oxide-Semiconductor", "Complementary MOSFET Operating System", "Cascaded Metal-Oxide-Semiconductor"]),
        "correct_answer": "Complementary Metal-Oxide-Semiconductor",
        "explanation": "CMOS stands for Complementary Metal-Oxide-Semiconductor. It uses complementary pairs of PMOS and NMOS transistors.",
        "xp_reward": 10,
    },
    {
        "lesson_slug": "cmos-inverter-fundamentals",
        "title": "CMOS Inverter Transistors",
        "exercise_type": "multiple_choice",
        "difficulty": 1,
        "question": "How many transistors are in a CMOS inverter?",
        "options": json.dumps(["2", "4", "6", "8"]),
        "correct_answer": "2",
        "explanation": "A CMOS inverter consists of exactly 2 transistors: one PMOS (pull-up) and one NMOS (pull-down).",
        "xp_reward": 10,
    },
    {
        "lesson_slug": "cmos-inverter-fundamentals",
        "title": "CMOS Inverter Logic",
        "exercise_type": "multiple_choice",
        "difficulty": 2,
        "question": "What logic operation does a CMOS inverter perform?",
        "options": json.dumps(["NOT", "AND", "OR", "XOR"]),
        "correct_answer": "NOT",
        "explanation": "A CMOS inverter performs the logical NOT operation: it inverts the input signal.",
        "xp_reward": 15,
    },
    {
        "lesson_slug": "boolean-algebra-basics",
        "title": "Boolean AND Operation",
        "exercise_type": "multiple_choice",
        "difficulty": 1,
        "question": "What is the output of A AND B when A=1 and B=0?",
        "options": json.dumps(["0", "1", "Cannot determine", "Depends on implementation"]),
        "correct_answer": "0",
        "explanation": "AND returns 1 only when both inputs are 1. Since B=0, the output is 0.",
        "xp_reward": 10,
    },
    {
        "lesson_slug": "boolean-algebra-basics",
        "title": "Boolean OR Operation",
        "exercise_type": "multiple_choice",
        "difficulty": 1,
        "question": "What is the output of A OR B when A=0 and B=1?",
        "options": json.dumps(["0", "1", "Cannot determine", "Undefined"]),
        "correct_answer": "1",
        "explanation": "OR returns 1 when at least one input is 1. Since B=1, the output is 1.",
        "xp_reward": 10,
    },
    {
        "lesson_slug": "boolean-algebra-basics",
        "title": "DeMorgan's Law",
        "exercise_type": "multiple_choice",
        "difficulty": 3,
        "question": "According to DeMorgan's Law, NOT(A AND B) is equivalent to:",
        "options": json.dumps(["NOT A OR NOT B", "NOT A AND NOT B", "A OR B", "A AND NOT B"]),
        "correct_answer": "NOT A OR NOT B",
        "explanation": "DeMorgan's Law: NOT(A AND B) = NOT A OR NOT B. The AND becomes OR and each term is complemented.",
        "xp_reward": 20,
    },
    {
        "lesson_slug": "verilog-rtl-basics",
        "title": "Verilog Module Syntax",
        "exercise_type": "multiple_choice",
        "difficulty": 1,
        "question": "Which keyword defines a module in Verilog?",
        "options": json.dumps(["module", "function", "class", "struct"]),
        "correct_answer": "module",
        "explanation": "In Verilog, 'module' is the keyword used to define a hardware module.",
        "xp_reward": 10,
    },
    {
        "lesson_slug": "verilog-rtl-basics",
        "title": "Verilog Wire vs Reg",
        "exercise_type": "multiple_choice",
        "difficulty": 2,
        "question": "In Verilog, which data type can be assigned inside an always block?",
        "options": json.dumps(["reg", "wire", "Both", "Neither"]),
        "correct_answer": "reg",
        "explanation": "Inside an always block, you must use 'reg' type. 'wire' is used for continuous assignments.",
        "xp_reward": 15,
    },
    {
        "lesson_slug": "static-timing-analysis",
        "title": "Setup Time",
        "exercise_type": "multiple_choice",
        "difficulty": 2,
        "question": "Setup time violation occurs when:",
        "options": json.dumps(["Data arrives too late before the clock edge", "Data arrives too early after the clock edge", "Clock period is too long", "Data changes during the hold window"]),
        "correct_answer": "Data arrives too late before the clock edge",
        "explanation": "Setup time is the minimum time data must be stable before the clock edge. A violation means data arrived too late.",
        "xp_reward": 15,
    },
    {
        "lesson_slug": "static-timing-analysis",
        "title": "Hold Time",
        "exercise_type": "multiple_choice",
        "difficulty": 2,
        "question": "A hold time violation means:",
        "options": json.dumps(["Data changes too soon after the clock edge", "Data arrives too late before the clock edge", "The clock frequency is too high", "Setup slack is negative"]),
        "correct_answer": "Data changes too soon after the clock edge",
        "explanation": "Hold time is the minimum time data must remain stable after the clock edge. A violation means data changed too quickly.",
        "xp_reward": 15,
    },
    {
        "lesson_slug": "asic-design-flow",
        "title": "ASIC Flow Steps",
        "exercise_type": "multiple_choice",
        "difficulty": 1,
        "question": "What is the correct order of the basic ASIC design flow?",
        "options": json.dumps(["RTL Design -> Synthesis -> P&R -> Verification", "Verification -> RTL Design -> P&R -> Synthesis", "Synthesis -> RTL Design -> Verification -> P&R", "P&R -> Synthesis -> RTL Design -> Verification"]),
        "correct_answer": "RTL Design -> Synthesis -> P&R -> Verification",
        "explanation": "The standard flow is: RTL Design -> Logic Synthesis -> Place & Route -> Verification/Tapeout.",
        "xp_reward": 10,
    },
    {
        "lesson_slug": "asic-design-flow",
        "title": "Logic Synthesis",
        "exercise_type": "multiple_choice",
        "difficulty": 2,
        "question": "What does logic synthesis convert RTL code into?",
        "options": json.dumps(["Gate-level netlist", "Transistor layout", "Verilog code", "Behavioral model"]),
        "correct_answer": "Gate-level netlist",
        "explanation": "Logic synthesis transforms RTL (behavioral) code into a gate-level netlist using a technology library.",
        "xp_reward": 15,
    },
]


async def seed_exercises():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        result = await db.execute(select(Lesson))
        lessons = {l.slug: l.id for l in result.scalars().all()}

        existing = await db.execute(select(Exercise).limit(1))
        if existing.scalar_one_or_none():
            print("Exercises already seeded.")
            return

        count = 0
        for ex in EXERCISES:
            lesson_id = lessons.get(ex["lesson_slug"])
            exercise = Exercise(
                id=str(uuid.uuid4()),
                lesson_id=lesson_id,
                title=ex["title"],
                exercise_type=ex["exercise_type"],
                difficulty=ex["difficulty"],
                question=ex["question"],
                options=ex["options"],
                correct_answer=ex["correct_answer"],
                explanation=ex["explanation"],
                xp_reward=ex["xp_reward"],
            )
            db.add(exercise)
            count += 1

        await db.commit()
        print(f"Seeded {count} exercises.")


if __name__ == "__main__":
    asyncio.run(seed_exercises())
