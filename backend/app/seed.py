"""Seed the database with initial curriculum data.

Usage:
    cd backend
    python -m app.seed
"""

import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.database import Base
from app.models.module import Module, Lesson

DATABASE_URL = "sqlite+aiosqlite:///./seed.db"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

MODULES = [
    # Milestone 1: Electronics Foundations
    {
        "title": "Voltage, Current & Resistance",
        "slug": "voltage-current-resistance",
        "description": "Fundamental electrical quantities and Ohm's Law.",
        "subject": "Electronics Foundations",
        "order": 1,
        "milestone_id": 1,
        "lessons": [
            {"title": "What is Voltage?", "slug": "what-is-voltage", "duration_minutes": 10, "order": 1,
             "content": "# What is Voltage?\n\n## Definition\nVoltage is the electrical potential difference between two points. It is the force that pushes electric charges through a conductor, analogous to water pressure in a pipe.\n\n## Key Concepts\n- Measured in **Volts (V)**\n- Symbol: **V** or **E** (electromotive force)\n- Formula: V = W / Q (Work per unit Charge)\n- Voltage is always measured **between two points**\n\n## Analogy\nThink of voltage as water pressure in a tank. The higher the pressure (voltage), the more force the water (current) has to flow through a pipe (conductor).\n\n## Practical Examples\n- A battery provides DC voltage (e.g., 1.5V, 9V)\n- Wall outlets provide AC voltage (e.g., 120V, 230V)\n- A typical VLSI chip operates at 0.7V to 1.2V\n\n## Key Takeaway\nWithout voltage, there is no current flow. Voltage is the fundamental driving force in any electrical circuit."},
            {"title": "Current Flow", "slug": "current-flow", "duration_minutes": 10, "order": 2,
             "content": "# Current Flow\n\n## Definition\nElectric current is the flow of electric charge through a conductor. It is the rate at which charge passes a given point.\n\n## Key Concepts\n- Measured in **Amperes (A)**\n- Symbol: **I**\n- Formula: I = Q / t (Charge per unit Time)\n- Conventional current flows from **positive to negative**\n- Electron flow is from **negative to positive**\n\n## Types of Current\n- **DC (Direct Current):** Flows in one direction only (e.g., battery)\n- **AC (Alternating Current):** Changes direction periodically (e.g., wall outlet)\n\n## In VLSI\n- Digital circuits use DC current\n- Current flows through transistors when they are ON\n- Leakage current is a major concern in modern chips"},
            {"title": "Resistance & Ohm's Law", "slug": "resistance-ohms-law", "duration_minutes": 15, "order": 3,
             "content": "# Resistance & Ohm's Law\n\n## Resistance\nResistance is the opposition to current flow.\n- Measured in **Ohms (Ω)**\n- Symbol: **R**\n- Depends on material, length, cross-section, and temperature\n\n## Ohm's Law\nThe fundamental relationship between voltage, current, and resistance:\n\n**V = I × R**\n\nWhere:\n- V = Voltage (Volts)\n- I = Current (Amperes)\n- R = Resistance (Ohms)\n\n## Practical Examples\n- If V = 5V and R = 100Ω, then I = 5/100 = 0.05A = 50mA\n- If V = 1.2V and I = 1mA, then R = 1.2/0.001 = 1200Ω\n\n## In VLSI\n- Wire resistance causes voltage drops and delays\n- Higher resistance = slower circuits\n- Transistors act as variable resistors"},
            {"title": "Kirchhoff's Laws", "slug": "kirchhoffs-laws", "duration_minutes": 20, "order": 4,
             "content": "# Kirchhoff's Laws\n\n## Kirchhoff's Current Law (KCL)\nThe sum of currents entering a node equals the sum of currents leaving it.\n\n**ΣI_in = ΣI_out**\n\nThis is based on conservation of charge.\n\n## Kirchhoff's Voltage Law (KVL)\nThe sum of all voltages around any closed loop in a circuit equals zero.\n\n**ΣV = 0**\n\nThis is based on conservation of energy.\n\n## Example\nIn a series circuit with V=10V, R1=100Ω, R2=200Ω:\n- Total R = 300Ω\n- I = 10/300 = 33.3mA\n- V across R1 = 33.3mA × 100Ω = 3.33V\n- V across R2 = 33.3mA × 200Ω = 6.67V\n- Check: 3.33 + 6.67 = 10V ✓\n\n## In VLSI\nKCL is fundamental to analyzing circuits at the transistor level."},
        ],
    },
    {
        "title": "Semiconductor Physics",
        "slug": "semiconductor-physics",
        "description": "How semiconductors work at the atomic level.",
        "subject": "Electronics Foundations",
        "order": 2,
        "milestone_id": 1,
        "lessons": [
            {"title": "Crystal Structure", "slug": "crystal-structure", "duration_minutes": 15, "order": 1},
            {"title": "Doping & Charge Carriers", "slug": "doping-charge-carriers", "duration_minutes": 20, "order": 2},
            {"title": "PN Junction", "slug": "pn-junction", "duration_minutes": 20, "order": 3},
        ],
    },
    {
        "title": "MOSFET Fundamentals",
        "slug": "mosfet-fundamentals",
        "description": "The transistor that powers all digital logic.",
        "subject": "Electronics Foundations",
        "order": 3,
        "milestone_id": 1,
        "lessons": [
            {"title": "MOSFET Structure", "slug": "mosfet-structure", "duration_minutes": 20, "order": 1},
            {"title": "Operating Regions", "slug": "operating-regions", "duration_minutes": 25, "order": 2},
            {"title": "I-V Characteristics", "slug": "iv-characteristics", "duration_minutes": 20, "order": 3},
            {"title": "Threshold Voltage", "slug": "threshold-voltage", "duration_minutes": 15, "order": 4},
        ],
    },
    # Milestone 2: Digital Logic
    {
        "title": "Number Systems",
        "slug": "number-systems",
        "description": "Binary, hex, and number representation in digital systems.",
        "subject": "Digital Logic",
        "order": 4,
        "milestone_id": 2,
        "lessons": [
            {"title": "Binary Numbers", "slug": "binary-numbers", "duration_minutes": 12, "order": 1},
            {"title": "Hexadecimal & Octal", "slug": "hexadecimal-octal", "duration_minutes": 10, "order": 2},
            {"title": "Signed & Unsigned Integers", "slug": "signed-unsigned", "duration_minutes": 15, "order": 3},
        ],
    },
    {
        "title": "Boolean Algebra",
        "slug": "boolean-algebra",
        "description": "The math behind digital logic design.",
        "subject": "Digital Logic",
        "order": 5,
        "milestone_id": 2,
        "lessons": [
            {"title": "Logic Operations", "slug": "logic-operations", "duration_minutes": 15, "order": 1},
            {"title": "Boolean Theorems", "slug": "boolean-theorems", "duration_minutes": 20, "order": 2},
            {"title": "De Morgan's Laws", "slug": "de-morgan-laws", "duration_minutes": 15, "order": 3},
        ],
    },
    {
        "title": "Logic Gates & Circuits",
        "slug": "logic-gates-circuits",
        "description": "Building blocks of all digital systems.",
        "subject": "Digital Logic",
        "order": 6,
        "milestone_id": 2,
        "lessons": [
            {"title": "AND, OR, NOT Gates", "slug": "basic-gates", "duration_minutes": 15, "order": 1},
            {"title": "NAND, NOR, XOR Gates", "slug": "universal-gates", "duration_minutes": 15, "order": 2},
            {"title": "Multiplexers & Decoders", "slug": "mux-decoders", "duration_minutes": 20, "order": 3},
        ],
    },
    # Milestone 3: RTL Design
    {
        "title": "Introduction to Verilog",
        "slug": "intro-verilog",
        "description": "Your first HDL code.",
        "subject": "RTL Design",
        "order": 7,
        "milestone_id": 3,
        "lessons": [
            {"title": "What is HDL?", "slug": "what-is-hdl", "duration_minutes": 10, "order": 1},
            {"title": "Verilog Modules & Ports", "slug": "verilog-modules-ports", "duration_minutes": 20, "order": 2},
            {"title": "Data Types", "slug": "verilog-data-types", "duration_minutes": 20, "order": 3},
            {"title": "Operators & Expressions", "slug": "verilog-operators", "duration_minutes": 15, "order": 4},
        ],
    },
    {
        "title": "Combinational Logic in Verilog",
        "slug": "combinational-verilog",
        "description": "Designing combinational circuits with HDL.",
        "subject": "RTL Design",
        "order": 8,
        "milestone_id": 3,
        "lessons": [
            {"title": "assign Statements", "slug": "assign-statements", "duration_minutes": 15, "order": 1},
            {"title": "always @(*) Blocks", "slug": "always-combinational", "duration_minutes": 20, "order": 2},
            {"title": "Building an ALU", "slug": "building-alu", "duration_minutes": 25, "order": 3},
        ],
    },
    {
        "title": "Sequential Logic & Flip-Flops",
        "slug": "sequential-logic",
        "description": "Memory elements and clocked logic.",
        "subject": "RTL Design",
        "order": 9,
        "milestone_id": 3,
        "lessons": [
            {"title": "D Flip-Flop", "slug": "d-flip-flop", "duration_minutes": 15, "order": 1},
            {"title": "Registers & Latches", "slug": "registers-latches", "duration_minutes": 20, "order": 2},
            {"title": "Counters", "slug": "counters", "duration_minutes": 20, "order": 3},
            {"title": "Shift Registers", "slug": "shift-registers", "duration_minutes": 18, "order": 4},
        ],
    },
    {
        "title": "Finite State Machines",
        "slug": "finite-state-machines",
        "description": "Designing sequential controllers with FSMs.",
        "subject": "RTL Design",
        "order": 10,
        "milestone_id": 3,
        "lessons": [
            {"title": "FSM Basics", "slug": "fsm-basics", "duration_minutes": 20, "order": 1},
            {"title": "Moore vs Mealy", "slug": "moore-vs-mealy", "duration_minutes": 18, "order": 2},
            {"title": "FSM Coding Styles", "slug": "fsm-coding-styles", "duration_minutes": 25, "order": 3},
        ],
    },
    # Milestone 4: CMOS & VLSI
    {
        "title": "CMOS Fabrication",
        "slug": "cmos-fabrication",
        "description": "How chips are manufactured.",
        "subject": "CMOS & VLSI",
        "order": 11,
        "milestone_id": 4,
        "lessons": [
            {"title": "Photolithography", "slug": "photolithography", "duration_minutes": 20, "order": 1},
            {"title": "Oxidation & Diffusion", "slug": "oxidation-diffusion", "duration_minutes": 18, "order": 2},
            {"title": "CMOS Process Steps", "slug": "cmos-process-steps", "duration_minutes": 25, "order": 3},
        ],
    },
    {
        "title": "Transistor Sizing",
        "slug": "transistor-sizing",
        "description": "Optimizing transistor dimensions for performance.",
        "subject": "CMOS & VLSI",
        "order": 12,
        "milestone_id": 4,
        "lessons": [
            {"title": "Pull-up vs Pull-down", "slug": "pull-up-pull-down", "duration_minutes": 15, "order": 1},
            {"title": "Logical Effort", "slug": "logical-effort", "duration_minutes": 25, "order": 2},
            {"title": "Sizing for Speed", "slug": "sizing-for-speed", "duration_minutes": 20, "order": 3},
        ],
    },
    # Milestone 5: ASIC Flow
    {
        "title": "Logic Synthesis",
        "slug": "logic-synthesis",
        "description": "Converting RTL to gate-level netlists.",
        "subject": "ASIC Flow",
        "order": 13,
        "milestone_id": 5,
        "lessons": [
            {"title": "What is Synthesis?", "slug": "what-is-synthesis", "duration_minutes": 15, "order": 1},
            {"title": "Timing Constraints", "slug": "timing-constraints", "duration_minutes": 25, "order": 2},
            {"title": "Synthesis Scripts", "slug": "synthesis-scripts", "duration_minutes": 20, "order": 3},
        ],
    },
    {
        "title": "Floorplanning",
        "slug": "floorplanning",
        "description": "Placing blocks and planning chip layout.",
        "subject": "ASIC Flow",
        "order": 14,
        "milestone_id": 5,
        "lessons": [
            {"title": "Chip Architecture", "slug": "chip-architecture", "duration_minutes": 18, "order": 1},
            {"title": "Power Planning", "slug": "power-planning", "duration_minutes": 22, "order": 2},
            {"title": "IO Placement", "slug": "io-placement", "duration_minutes": 18, "order": 3},
        ],
    },
    {
        "title": "Place & Route",
        "slug": "place-route",
        "description": "Physical placement and routing of cells.",
        "subject": "ASIC Flow",
        "order": 15,
        "milestone_id": 5,
        "lessons": [
            {"title": "Cell Placement", "slug": "cell-placement", "duration_minutes": 20, "order": 1},
            {"title": "Clock Tree Synthesis", "slug": "clock-tree-synthesis", "duration_minutes": 25, "order": 2},
            {"title": "Signal Routing", "slug": "signal-routing", "duration_minutes": 25, "order": 3},
        ],
    },
]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        existing = await session.execute(select(Module).limit(1))
        if existing.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        for mod_data in MODULES:
            lessons_data = mod_data.pop("lessons")
            mod = Module(id=str(uuid.uuid4()), **mod_data)
            session.add(mod)
            await session.flush()

            for lesson_data in lessons_data:
                lesson = Lesson(
                    id=str(uuid.uuid4()),
                    module_id=mod.id,
                    **lesson_data,
                )
                session.add(lesson)

        await session.commit()
        print(f"Seeded {len(MODULES)} modules with lessons.")


if __name__ == "__main__":
    asyncio.run(seed())
