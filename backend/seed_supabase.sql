-- VLSI-Tutor Seed Data for Supabase

-- Create tables if not exists
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) UNIQUE,
    hashed_password VARCHAR(255),
    display_name VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200),
    slug VARCHAR(200),
    description TEXT,
    subject VARCHAR(100),
    "order" INTEGER DEFAULT 0,
    milestone_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(36) PRIMARY KEY,
    module_id VARCHAR(36),
    title VARCHAR(200),
    slug VARCHAR(200),
    description TEXT,
    content TEXT,
    duration_minutes INTEGER DEFAULT 15,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS concepts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) UNIQUE,
    slug VARCHAR(200) UNIQUE,
    description TEXT,
    subject VARCHAR(100),
    topic VARCHAR(100),
    difficulty INTEGER DEFAULT 1,
    intuition TEXT,
    mathematical_explanation TEXT,
    physical_explanation TEXT,
    real_world_example TEXT,
    common_misconceptions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS concept_prerequisites (
    concept_id VARCHAR(36),
    prerequisite_id VARCHAR(36),
    strength FLOAT DEFAULT 1.0,
    PRIMARY KEY (concept_id, prerequisite_id)
);

CREATE TABLE IF NOT EXISTS exercises (
    id VARCHAR(36) PRIMARY KEY,
    concept_id VARCHAR(36),
    lesson_id VARCHAR(36),
    title VARCHAR(200),
    exercise_type VARCHAR(50),
    difficulty INTEGER DEFAULT 1,
    question TEXT,
    options TEXT,
    correct_answer TEXT,
    explanation TEXT,
    xp_reward INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_attempts (
    id VARCHAR(36) PRIMARY KEY,
    exercise_id VARCHAR(36),
    user_id VARCHAR(36),
    answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    time_seconds FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mastery (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    concept_id VARCHAR(36),
    score FLOAT DEFAULT 0.0,
    confidence FLOAT DEFAULT 0.0,
    attempts INTEGER DEFAULT 0,
    correct INTEGER DEFAULT 0,
    last_reviewed TIMESTAMPTZ,
    next_review TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_schedule (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    concept_id VARCHAR(36),
    scheduled_at TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500),
    author VARCHAR(200),
    organization VARCHAR(200),
    resource_type VARCHAR(50),
    subject VARCHAR(100),
    topic VARCHAR(100),
    difficulty VARCHAR(20),
    source_url TEXT,
    license VARCHAR(100),
    description TEXT,
    authority_score FLOAT,
    quality_score FLOAT,
    drive_location TEXT,
    processing_status VARCHAR(20) DEFAULT 'pending',
    extraction_status VARCHAR(20) DEFAULT 'pending',
    indexing_status VARCHAR(20) DEFAULT 'pending',
    embedding_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resource_chunks (
    id VARCHAR(36) PRIMARY KEY,
    resource_id VARCHAR(36),
    chunk_index INTEGER,
    content TEXT,
    content_hash VARCHAR(64),
    metadata_json TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    title VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id VARCHAR(36) NOT NULL REFERENCES conversations(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    lesson_id VARCHAR(36),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    lesson_id VARCHAR(36) NOT NULL REFERENCES lessons(id),
    completed BOOLEAN DEFAULT FALSE,
    score FLOAT DEFAULT 0.0,
    time_spent_minutes INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);

-- Modules
INSERT INTO modules (id, title, slug, description, subject, "order", milestone_id) VALUES
('m001', 'Voltage, Current & Resistance', 'voltage-current-resistance', 'Fundamental electrical quantities and Ohm''s Law.', 'Electronics Foundations', 1, 1),
('m002', 'Semiconductor Physics', 'semiconductor-physics', 'How semiconductors work at the atomic level.', 'Electronics Foundations', 2, 1),
('m003', 'MOSFET Fundamentals', 'mosfet-fundamentals', 'The transistor that powers all digital logic.', 'Electronics Foundations', 3, 1),
('m004', 'Number Systems', 'number-systems', 'Binary, hex, and number representation in digital systems.', 'Digital Logic', 4, 2),
('m005', 'Boolean Algebra', 'boolean-algebra', 'The math behind digital logic design.', 'Digital Logic', 5, 2),
('m006', 'Logic Gates & Circuits', 'logic-gates-circuits', 'Building blocks of all digital systems.', 'Digital Logic', 6, 2),
('m007', 'Introduction to Verilog', 'intro-verilog', 'Your first HDL code.', 'RTL Design', 7, 3),
('m008', 'Combinational Logic in Verilog', 'combinational-verilog', 'Designing combinational circuits with HDL.', 'RTL Design', 8, 3),
('m009', 'Sequential Logic & Flip-Flops', 'sequential-logic', 'Memory elements and clocked logic.', 'RTL Design', 9, 3),
('m010', 'Finite State Machines', 'finite-state-machines', 'Designing sequential controllers with FSMs.', 'RTL Design', 10, 3),
('m011', 'CMOS Fabrication', 'cmos-fabrication', 'How chips are manufactured.', 'CMOS & VLSI', 11, 4),
('m012', 'Transistor Sizing', 'transistor-sizing', 'Optimizing transistor dimensions for performance.', 'CMOS & VLSI', 12, 4),
('m013', 'Logic Synthesis', 'logic-synthesis', 'Converting RTL to gate-level netlists.', 'ASIC Flow', 13, 5),
('m014', 'Floorplanning', 'floorplanning', 'Placing blocks and planning chip layout.', 'ASIC Flow', 14, 5),
('m015', 'Place & Route', 'place-route', 'Physical placement and routing of cells.', 'ASIC Flow', 15, 5);

-- Lessons
INSERT INTO lessons (id, module_id, title, slug, description, content, duration_minutes, "order") VALUES
('l001', 'm001', 'What is Voltage?', 'what-is-voltage', NULL, '# What is Voltage?

## Definition
Voltage is the electrical potential difference between two points. It is the force that pushes electric charges through a conductor, analogous to water pressure in a pipe.

## Key Concepts
- Measured in **Volts (V)**
- Symbol: **V** or **E** (electromotive force)
- Formula: V = W / Q (Work per unit Charge)
- Voltage is always measured **between two points**

## Analogy
Think of voltage as water pressure in a tank. The higher the pressure (voltage), the more force the water (current) has to flow through a pipe (conductor).

## Practical Examples
- A battery provides DC voltage (e.g., 1.5V, 9V)
- Wall outlets provide AC voltage (e.g., 120V, 230V)
- A typical VLSI chip operates at 0.7V to 1.2V

## Key Takeaway
Without voltage, there is no current flow. Voltage is the fundamental driving force in any electrical circuit.', 10, 1),
('l002', 'm001', 'Current Flow', 'current-flow', NULL, '# Current Flow

## Definition
Electric current is the flow of electric charge through a conductor. It is the rate at which charge passes a given point.

## Key Concepts
- Measured in **Amperes (A)**
- Symbol: **I**
- Formula: I = Q / t (Charge per unit Time)
- Conventional current flows from **positive to negative**
- Electron flow is from **negative to positive**

## Types of Current
- **DC (Direct Current):** Flows in one direction only (e.g., battery)
- **AC (Alternating Current):** Changes direction periodically (e.g., wall outlet)

## In VLSI
- Digital circuits use DC current
- Current flows through transistors when they are ON
- Leakage current is a major concern in modern chips', 10, 2),
('l003', 'm001', 'Resistance and Ohm''s Law', 'resistance-ohms-law', NULL, '# Resistance and Ohm''s Law

## Resistance
Resistance is the opposition to current flow.
- Measured in **Ohms**
- Symbol: **R**
- Depends on material, length, cross-section, and temperature

## Ohm''s Law
The fundamental relationship between voltage, current, and resistance:

**V = I x R**

Where:
- V = Voltage (Volts)
- I = Current (Amperes)
- R = Resistance (Ohms)

## Practical Examples
- If V = 5V and R = 100 ohms, then I = 5/100 = 0.05A = 50mA
- If V = 1.2V and I = 1mA, then R = 1.2/0.001 = 1200 ohms

## In VLSI
- Wire resistance causes voltage drops and delays
- Higher resistance = slower circuits
- Transistors act as variable resistors', 15, 3),
('l004', 'm001', 'Kirchhoffs Laws', 'kirchhoffs-laws', NULL, '# Kirchhoffs Laws

## Kirchhoffs Current Law (KCL)
The sum of currents entering a node equals the sum of currents leaving it.

**Sum(I_in) = Sum(I_out)**

This is based on conservation of charge.

## Kirchhoffs Voltage Law (KVL)
The sum of all voltages around any closed loop in a circuit equals zero.

**Sum(V) = 0**

This is based on conservation of energy.

## Example
In a series circuit with V=10V, R1=100 ohms, R2=200 ohms:
- Total R = 300 ohms
- I = 10/300 = 33.3mA
- V across R1 = 33.3mA x 100 ohms = 3.33V
- V across R2 = 33.3mA x 200 ohms = 6.67V
- Check: 3.33 + 6.67 = 10V

## In VLSI
KCL is fundamental to analyzing circuits at the transistor level.', 20, 4),
('l005', 'm002', 'Crystal Structure', 'crystal-structure', NULL, '# Crystal Structure

## Silicon Crystal
Silicon is the foundation of all modern electronics. In its pure form, silicon forms a diamond cubic crystal structure where each atom is bonded to 4 neighbors.

## Key Concepts
- Silicon has 4 valence electrons
- Each Si atom forms 4 covalent bonds
- At 0K, all electrons are bound (insulator)
- At room temperature, some electrons gain enough energy to break free (semiconductor)

## Crystal Lattice
- Lattice constant: 5.43 Angstrom
- 8 atoms per unit cell
- Bond energy: 1.1 eV (bandgap of silicon)

## Why Silicon?
- Abundant (second most common element in Earths crust)
- Excellent oxide (SiO2) for insulation
- Perfect bandgap for room-temperature operation', 15, 1),
('l006', 'm002', 'Doping and Charge Carriers', 'doping-charge-carriers', NULL, '# Doping and Charge Carriers

## What is Doping?
Doping is the intentional introduction of impurities into silicon to change its electrical properties.

## N-type Doping
- Add atoms with 5 valence electrons (Phosphorus, Arsenic)
- Extra electron becomes a free charge carrier
- Majority carriers: **electrons**
- Minority carriers: **holes**

## P-type Doping
- Add atoms with 3 valence electrons (Boron, Gallium)
- Missing electron creates a hole
- Majority carriers: **holes**
- Minority carriers: **electrons**

## Carrier Concentration
- n x p = ni squared (mass action law)
- ni (intrinsic) = 1.5 x 10^10 cm^-3 at 300K
- Doping levels: 10^14 to 10^20 cm^-3', 20, 2),
('l007', 'm002', 'PN Junction', 'pn-junction', NULL, '# PN Junction

## Formation
When P-type and N-type silicon are joined, carriers diffuse across the junction creating a depletion region.

## Depletion Region
- No free carriers
- Built-in electric field
- Typical width: 0.1 to 1 micron
- Built-in potential: ~0.7V for silicon

## Forward Bias
- Positive voltage on P-side
- Narrows depletion region
- Current flows easily
- Used in: diodes, LED, solar cells

## Reverse Bias
- Positive voltage on N-side
- Widens depletion region
- Very little current flows
- Used in: capacitors, isolation

## In VLSI
- Every transistor has PN junctions
- Junction capacitance affects speed
- Reverse leakage is a power concern', 20, 3),
('l008', 'm003', 'MOSFET Structure', 'mosfet-structure', NULL, '# MOSFET Structure

## The MOSFET
The Metal-Oxide-Semiconductor Field-Effect Transistor is the building block of all digital logic.

## Four Terminals
- **Gate (G):** Controls the transistor
- **Source (S):** Where current enters
- **Drain (D):** Where current exits
- **Body/Substrate (B):** Usually connected to source

## NMOS vs PMOS
- **NMOS:** N-type source/drain in P-type substrate
- **PMOS:** P-type source/drain in N-type substrate

## Gate Oxide
- Thin insulating layer (SiO2)
- Typical thickness: 1-5 nm in modern processes
- Controls the channel formation

## Channel
- Forms under the gate when voltage is applied
- Inversion layer of charge carriers
- Length (L) and Width (W) define transistor size', 20, 1),
('l009', 'm003', 'Operating Regions', 'operating-regions', NULL, '# Operating Regions

## Cutoff Region
- Vgs < Vth (threshold voltage)
- No current flows
- Transistor is OFF
- Used for: logic 0 state

## Linear/Triode Region
- Vgs > Vth and Vds < Vgs - Vth
- Acts like a variable resistor
- Used for: pass transistors

## Saturation Region
- Vgs > Vth and Vds >= Vgs - Vth
- Current is constant (independent of Vds)
- Used for: amplifiers, current sources

## Velocity Saturation
- In short-channel devices, carriers reach maximum velocity
- Current equation changes
- Important in modern sub-micron processes', 25, 2),
('l010', 'm003', 'I-V Characteristics', 'iv-characteristics', NULL, '# I-V Characteristics

## Transfer Characteristics (Id vs Vgs)
Shows how drain current changes with gate voltage at constant Vds.

Key points:
- Threshold voltage (Vth): where current starts flowing
- Subthreshold slope: how sharply it turns on
- Transconductance (gm): rate of change of Id with Vgs

## Output Characteristics (Id vs Vds)
Shows how drain current changes with drain voltage at constant Vgs.

Key regions:
- Linear region: steep slope
- Saturation region: flat curve
- Breakdown: sharp current increase

## Parameters
- mu_n: electron mobility
- Cox: gate oxide capacitance
- W/L: transistor aspect ratio
- Vth: threshold voltage (~0.4-0.7V)

## In VLSI Design
- We operate transistors in saturation for amplifiers
- We use linear region for switches
- We want high gm/ID ratio for efficiency', 20, 3),
('l011', 'm003', 'Threshold Voltage', 'threshold-voltage', NULL, '# Threshold Voltage

## Definition
Threshold voltage (Vth) is the minimum gate-to-source voltage needed to create a conducting channel.

## Factors Affecting Vth
- **Doping concentration:** Higher doping leads to higher Vth
- **Oxide thickness:** Thicker oxide leads to higher Vth
- **Body effect:** Reverse body bias increases Vth
- **Temperature:** Higher temp leads to lower Vth

## In VLSI
- Different Vth options (HVT, SVT, LVT) for power/speed tradeoff
- Low-Vth transistors are faster but leak more
- High-Vth transistors save power but are slower', 15, 4),
('l012', 'm004', 'Binary Numbers', 'binary-numbers', NULL, '# Binary Numbers

## Base-2 System
Binary uses only two digits: 0 and 1. Each position represents a power of 2.

## Position Values
- 1 = 2^0
- 10 = 2^1 = 2
- 100 = 2^2 = 4
- 1000 = 2^3 = 8

## Conversion
**Binary to Decimal:** Sum the powers of 2 where bits are 1
- 1011 (binary) = 8 + 0 + 2 + 1 = 11 (decimal)

**Decimal to Binary:** Divide by 2, track remainders
- 13 (decimal) = 1101 (binary)

## In Digital Logic
- 0 = LOW = GND = False
- 1 = HIGH = VDD = True
- All digital operations are binary at the hardware level', 12, 1),
('l013', 'm004', 'Hexadecimal and Octal', 'hexadecimal-octal', NULL, '# Hexadecimal and Octal

## Hexadecimal (Base-16)
Uses digits 0-9 and letters A-F (A=10, B=11, ... F=15).

**Why hex?**
- Each hex digit = exactly 4 bits
- Easy to represent binary in compact form
- Example: 0x1A3F = 0001 1010 0011 1111

## Octal (Base-8)
Uses digits 0-7. Each octal digit = 3 bits.

## In VLSI
- Hex is standard for specifying addresses and data
- Memory sizes are powers of 2 (KB, MB, GB)', 10, 2),
('l014', 'm004', 'Signed and Unsigned Integers', 'signed-unsigned', NULL, '# Signed and Unsigned Integers

## Unsigned
- All bits represent magnitude
- Range: 0 to 2^n - 1
- Example (8-bit): 0 to 255

## Signed (Twos Complement)
- MSB is the sign bit (0=positive, 1=negative)
- To negate: invert all bits and add 1
- Range: -2^(n-1) to 2^(n-1) - 1
- Example (8-bit): -128 to 127

## Why Twos Complement?
- Addition and subtraction use the same hardware
- No separate sign circuit needed
- Zero has only one representation', 15, 3),
('l015', 'm005', 'Logic Operations', 'logic-operations', NULL, '# Logic Operations

## AND
Output is 1 only if both inputs are 1.

## OR
Output is 1 if at least one input is 1.

## NOT
Inverts the input.

## NAND
NOT of AND. A universal gate.

## NOR
NOT of OR. Also a universal gate.

## XOR
Output is 1 if inputs are different.', 15, 1),
('l016', 'm005', 'Boolean Theorems', 'boolean-theorems', NULL, '# Boolean Theorems

## Identity Laws
- A + 0 = A
- A . 1 = A

## Null Laws
- A + 1 = 1
- A . 0 = 0

## Idempotent Laws
- A + A = A
- A . A = A

## Complement Laws
- A + (NOT A) = 1
- A . (NOT A) = 0

## Commutative Laws
- A + B = B + A
- A . B = B . A

## Associative Laws
- (A + B) + C = A + (B + C)
- (A . B) . C = A . (B . C)

## Distributive Laws
- A . (B + C) = A.B + A.C
- A + (B . C) = (A+B) . (A+C)

## Absorption Laws
- A + (A . B) = A
- A . (A + B) = A', 20, 2),
('l017', 'm005', 'De Morgans Laws', 'de-morgan-laws', NULL, '# De Morgans Laws

## First Law
**NOT(A + B) = (NOT A) . (NOT B)**

The complement of an OR is the AND of the complements.

## Second Law
**NOT(A . B) = (NOT A) + (NOT B)**

The complement of an AND is the OR of the complements.

## Why Important?
- Allows converting between AND and OR forms
- Essential for circuit simplification
- Enables implementation with only NAND or only NOR gates

## Application
Any Boolean function can be implemented using only NAND gates or only NOR gates (universal gates).', 15, 3),
('l018', 'm006', 'AND, OR, NOT Gates', 'basic-gates', NULL, '# AND, OR, NOT Gates

## AND Gate
- Output HIGH only when all inputs HIGH
- Boolean: Y = A . B

## OR Gate
- Output HIGH when any input is HIGH
- Boolean: Y = A + B

## NOT Gate (Inverter)
- Output is complement of input
- Boolean: Y = NOT A', 15, 1),
('l019', 'm006', 'NAND, NOR, XOR Gates', 'universal-gates', NULL, '# NAND, NOR, XOR Gates

## NAND Gate
- AND followed by NOT
- Universal gate: can build any circuit

## NOR Gate
- OR followed by NOT
- Also a universal gate

## XOR Gate
- Exclusive OR: output HIGH when inputs differ
- Used for: adders, parity, comparison

## XNOR Gate
- XOR followed by NOT
- Output HIGH when inputs are equal', 15, 2),
('l020', 'm006', 'Multiplexers and Decoders', 'mux-decoders', NULL, '# Multiplexers and Decoders

## Multiplexer (MUX)
A MUX selects one of many inputs based on select lines.

## Demultiplexer (DEMUX)
A DEMUX routes one input to one of many outputs based on select lines.

## Decoder
A decoder converts n-bit input to 2^n outputs (one-hot).

## Applications
- MUX: data selection, bus sharing
- DEMUX: data distribution
- Decoder: address decoding, instruction decode', 20, 3),
('l021', 'm007', 'What is HDL?', 'what-is-hdl', NULL, '# What is HDL?

## Hardware Description Language
An HDL is a programming language used to describe digital hardware circuits.

## Why HDL?
- Modern chips have billions of transistors
- Cannot design by hand at transistor level
- HDL allows describing behavior at higher abstraction

## Major HDLs
- **Verilog:** C-like syntax, widely used in industry
- **SystemVerilog:** Extension of Verilog with OOP features
- **VHDL:** Ada-like syntax, common in defense/aerospace

## Design Flow
1. Write RTL code (Verilog/SystemVerilog)
2. Simulate and verify
3. Synthesize to gates
4. Place and route
5. Tapeout', 10, 1),
('l022', 'm007', 'Verilog Modules and Ports', 'verilog-modules-ports', NULL, '# Verilog Modules and Ports

## Module
The basic building block in Verilog. Describes a hardware component.

## Port Types
- **input:** Signal coming into the module
- **output:** Signal going out of the module
- **inout:** Bidirectional signal (used for buses)

## Port Data Types
- **wire:** Combinational (default)
- **reg:** Holds value (used in always blocks)', 20, 2),
('l023', 'm007', 'Data Types', 'verilog-data-types', NULL, '# Verilog Data Types

## Net Types
- **wire:** Default, connects components
- **tri:** Same as wire (for clarity)

## Register Types
- **reg:** Holds value between assignments
- **integer:** 32-bit signed (for loops, temp values)

## Vector Types
- wire [7:0] byte: 8-bit vector
- reg [31:0] word: 32-bit register', 20, 3),
('l024', 'm007', 'Operators and Expressions', 'verilog-operators', NULL, '# Operators and Expressions

## Arithmetic
- + Addition, - Subtraction, * Multiplication, / Division, % Modulus

## Logical
- && AND, || OR, ! NOT

## Bitwise
- & AND, | OR, ^ XOR, ~ NOT

## Shift
- << Left shift, >> Right shift

## Concatenation
- {a, b, c} Concatenate bits', 15, 4),
('l025', 'm008', 'assign Statements', 'assign-statements', NULL, '# assign Statements

## Continuous Assignment
The assign keyword creates combinational logic that updates continuously.

## Rules
- Cannot be used inside always blocks
- Right-hand side is evaluated continuously
- Left-hand side must be a wire (not reg)

## When to Use
- Simple combinational logic
- Connecting modules', 15, 1),
('l026', 'm008', 'always @(*) Blocks', 'always-combinational', NULL, '# always @(*) Blocks

## Combinational Always Block
Used for more complex combinational logic.

## Rules
- Left-hand side must be reg type
- All possible inputs must be assigned
- Avoid latches (assign all outputs in all branches)', 20, 2),
('l027', 'm008', 'Building an ALU', 'building-alu', NULL, '# Building an ALU

## What is an ALU?
An Arithmetic Logic Unit performs arithmetic and logical operations. It is the core of every CPU.

## ALU Operations
- ADD, SUB (arithmetic)
- AND, OR, XOR (logical)
- SHIFT, ROTATE (barrel shifter)
- COMPARE (set flags)', 25, 3),
('l028', 'm009', 'D Flip-Flop', 'd-flip-flop', NULL, '# D Flip-Flop

## What is a Flip-Flop?
A flip-flop stores one bit of data. It samples input on a clock edge and holds the value.

## D Flip-Flop
- D = Data input
- Q = Output
- CLK = Clock input

## Timing Parameters
- Setup time: Data must be stable before clock edge
- Hold time: Data must be stable after clock edge
- Clock-to-Q: Delay from clock edge to output change', 15, 1),
('l029', 'm009', 'Registers and Latches', 'registers-latches', NULL, '# Registers and Latches

## Latch (Level-Sensitive)
- Transparent when enable is HIGH
- Holds value when enable is LOW
- Avoid in modern design (hard to time)

## Register (Edge-Triggered)
- Samples on clock edge
- Holds value between edges
- Standard storage element

## Why Avoid Latches?
- Timing analysis is harder
- Prone to glitches
- Not synthesizable in some flows', 20, 2),
('l030', 'm009', 'Counters', 'counters', NULL, '# Counters

## Binary Counter
Counts through binary sequence on each clock edge.

## Up/Down Counter
Counts up or down based on control signal.

## Modulo Counter
Counts from 0 to N-1, then wraps around.

## Applications
- Clock dividers
- Address generators
- Timers
- FSM state registers', 20, 3),
('l031', 'm009', 'Shift Registers', 'shift-registers', NULL, '# Shift Registers

## Serial-In Serial-Out (SISO)
Shifts data through a chain of flip-flops.

## Parallel-In Parallel-Out (PIPO)
Loads and outputs data simultaneously.

## Applications
- Serial communication (UART, SPI)
- Data alignment
- Delay lines
- Pseudo-random number generators (LFSR)', 18, 4),
('l032', 'm010', 'FSM Basics', 'fsm-basics', NULL, '# FSM Basics

## What is an FSM?
A Finite State Machine is a mathematical model of computation. It transitions between a finite number of states based on inputs.

## Components
- **States:** Finite set of conditions
- **Transitions:** Rules for moving between states
- **Inputs:** Signals that trigger transitions
- **Outputs:** Signals produced in each state

## Two Types
- **Moore Machine:** Output depends only on current state
- **Mealy Machine:** Output depends on current state AND inputs', 20, 1),
('l033', 'm010', 'Moore vs Mealy', 'moore-vs-mealy', NULL, '# Moore vs Mealy

## Moore Machine
- Output depends ONLY on current state
- Output is registered (cleaner timing)
- More states may be needed

## Mealy Machine
- Output depends on current state AND inputs
- Output is combinational (faster response)
- Fewer states needed

## Comparison
| Feature | Moore | Mealy |
|---------|-------|-------|
| Output depends on | State only | State + Input |
| Response time | 1 clock cycle | Immediate |
| Number of states | More | Fewer |', 18, 2),
('l034', 'm010', 'FSM Coding Styles', 'fsm-coding-styles', NULL, '# FSM Coding Styles

## Three-Process Style (Recommended)
Separates concerns into three always blocks:
1. State register
2. Next state logic (combinational)
3. Output logic (combinational or registered)

## Best Practices
- Use three-process style for clarity
- Define states as localparam or enum
- Always handle reset state
- Add default case in all case statements', 25, 3),
('l035', 'm011', 'Photolithography', 'photolithography', NULL, '# Photolithography

## What is Photolithography?
The process of transferring a pattern from a mask to a wafer using light.

## Steps
1. Coating: Apply photoresist
2. Exposure: UV light through mask pattern
3. Development: Remove exposed photoresist
4. Etching: Remove material
5. Stripping: Remove remaining photoresist

## Evolution
- G-line (436nm): 1um features
- I-line (365nm): 0.35um features
- DUV (248nm): 0.18um features
- DUV (193nm): 65nm features
- EUV (13.5nm): 7nm and below', 20, 1),
('l036', 'm011', 'Oxidation and Diffusion', 'oxidation-diffusion', NULL, '# Oxidation and Diffusion

## Thermal Oxidation
Growing silicon dioxide (SiO2) on silicon surfaces.

**Types:**
- Dry oxidation: slower, higher quality
- Wet oxidation: faster

## Diffusion
Moving dopant atoms into silicon at high temperature.

## Ion Implantation
Modern alternative to diffusion:
- Precise dose control
- Lower temperature
- Better uniformity', 18, 2),
('l037', 'm011', 'CMOS Process Steps', 'cmos-process-steps', NULL, '# CMOS Process Steps

## CMOS Fabrication Flow
1. Substrate preparation: P-type silicon wafer
2. Well formation: Create N-well for PMOS
3. Active area definition
4. Gate oxide growth
5. Polysilicon deposition
6. Gate patterning
7. Source/Drain implant
8. Annealing
9. Metal layers
10. Passivation

## Modern Process Nodes
- 28nm, 14nm, 10nm, 7nm, 5nm, 3nm
- Name refers to minimum feature (roughly)', 25, 3),
('l038', 'm012', 'Pull-up vs Pull-down', 'pull-up-pull-down', NULL, '# Pull-up vs Pull-down

## CMOS Inverter
The simplest CMOS circuit: one PMOS (pull-up) and one NMOS (pull-down).

## Pull-down Network (PDN)
- NMOS transistors
- Connects output to GND
- Conducts when input is HIGH

## Pull-up Network (PUN)
- PMOS transistors
- Connects output to VDD
- Conducts when input is LOW

## Sizing Rule
For symmetric rise/fall times: make PMOS 2-3x wider than NMOS.', 15, 1),
('l039', 'm012', 'Logical Effort', 'logical-effort', NULL, '# Logical Effort

## What is Logical Effort?
A method to estimate gate delay based on topology.

## Logical Effort Values
- Inverter: 1
- NAND2: 4/3
- NOR2: 5/3

## Path Effort
F = G x B x H
- G: product of logical efforts
- B: branching effort
- H: electrical effort', 25, 2),
('l040', 'm012', 'Sizing for Speed', 'sizing-for-speed', NULL, '# Sizing for Speed

## Goal
Minimize delay by proper transistor sizing.

## Power-Delay Tradeoff
- Larger transistors: faster but more power
- Smaller transistors: slower but less power

## In VLSI Design
- Standard cell libraries provide pre-sized gates
- Auto-placement tools optimize sizing
- Manual sizing for critical paths only', 20, 3),
('l041', 'm013', 'What is Synthesis?', 'what-is-synthesis', NULL, '# What is Synthesis?

## Definition
Synthesis converts RTL (behavioral) code into a gate-level netlist.

## Inputs
- RTL code (Verilog/VHDL)
- Technology library (.lib files)
- Constraints (.sdc file)

## Outputs
- Gate-level netlist
- Timing reports
- Area reports
- Power reports', 15, 1),
('l042', 'm013', 'Timing Constraints', 'timing-constraints', NULL, '# Timing Constraints

## What are Timing Constraints?
Rules that tell the synthesis tool what timing to achieve.

## Clock Definition
create_clock -period 10 -name clk

## Timing Equation
Tclk >= Tcq + Tlogic + Tsetup
- Tcq: clock-to-Q delay
- Tlogic: combinational logic delay
- Tsetup: flip-flop setup time', 25, 2),
('l043', 'm013', 'Synthesis Scripts', 'synthesis-scripts', NULL, '# Synthesis Scripts

## Basic Script Structure
1. Read libraries
2. Read RTL
3. Set top module
4. Create clock
5. Set constraints
6. Compile
7. Report
8. Write netlist

## Common Issues
- Unmapped logic: missing library cells
- Timing violations: need retiming or restructure
- Too much area: reduce logic depth', 20, 3),
('l044', 'm014', 'Chip Architecture', 'chip-architecture', NULL, '# Chip Architecture

## What is Floorplanning?
Defining the physical layout of major blocks on a chip.

## Components
- Core: Main logic area
- Periphery: I/O pads around the edge
- Power rings: VDD and GND around core
- Power stripes: Power distribution across chip

## Metrics
- Utilization: % of area used (target: 70-80%)
- Aspect ratio: Width/Height', 18, 1),
('l045', 'm014', 'Power Planning', 'power-planning', NULL, '# Power Planning

## Goal
Deliver clean, stable power to all transistors on the chip.

## Power Distribution
VDD Pad -> Power Ring -> Power Stripes -> Standard Cells
GND Pad -> Ground Ring -> Ground Stripes -> Standard Cells

## IR Drop
Voltage drop due to wire resistance: V = I x R

## EM (Electromigration)
Current density limit for metal wires.', 22, 2),
('l046', 'm014', 'IO Placement', 'io-placement', NULL, '# IO Placement

## IO Pads
Interface between chip and package.

## Types of IO
- Input pads: Buffer + ESD protection
- Output pads: Driver + ESD protection
- Bidirectional pads: Tri-state buffer
- Power pads: VDD, GND, VDDIO

## IO Standards
- LVCMOS: Low-voltage CMOS
- LVDS: Low-voltage differential signaling', 18, 3),
('l047', 'm015', 'Cell Placement', 'cell-placement', NULL, '# Cell Placement

## What is Placement?
Assigning physical locations to all standard cells.

## Placement Goals
- Minimize total wire length
- Meet timing constraints
- Reduce congestion

## Placement Algorithm
1. Global placement: Rough positions
2. Legalization: Snap to grid
3. Detailed placement: Local optimization', 20, 1),
('l048', 'm015', 'Clock Tree Synthesis', 'clock-tree-synthesis', NULL, '# Clock Tree Synthesis

## What is CTS?
Building a tree network to distribute the clock signal to all flip-flops.

## Goals
- Minimum skew: Clock arrives at same time everywhere
- Low insertion delay: Fast clock distribution

## Skew
Skew = max(clock delay) - min(clock delay)
- Target: less than 5% of clock period', 25, 2),
('l049', 'm015', 'Signal Routing', 'signal-routing', NULL, '# Signal Routing

## What is Routing?
Creating physical metal wires to connect all placed cells.

## Routing Layers
- Lower metals (M1-M3): local connections
- Upper metals (M4-M7): global routing, power

## DRC Rules
Design Rule Checking ensures manufacturability:
- Minimum wire width
- Minimum spacing between wires
- Via enclosure rules', 25, 3);