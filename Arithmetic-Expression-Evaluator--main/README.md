# Arithmetic Expression Evaluator
**Compiler Design Mini Project**

A fully client-side web application that demonstrates core compiler design concepts through interactive arithmetic expression analysis and evaluation.

---

## Project Overview

This tool takes an arithmetic expression as input and processes it through multiple compiler phases:

1. **Lexical Analysis** – Tokenizes the expression into numbers, operators, and parentheses.
2. **Syntax Validation** – Verifies the expression is structurally correct.
3. **Infix → Postfix Conversion** – Applies the Shunting Yard Algorithm to convert the expression to Reverse Polish Notation.
4. **Expression Evaluation** – Evaluates the postfix expression using a stack.

Diagrams (flowchart, block diagram, expression tree, and stack visualization) are rendered using HTML5 Canvas and SVG — no external libraries required.

---

## Features

| Feature | Description |
|---|---|
| Lexical Analysis | Tokenizes input; classifies each token (NUMBER, OPERATOR, PARENTHESIS) |
| Syntax Analysis | Checks balanced parentheses, valid operators, legal start/end |
| Infix → Postfix | Shunting Yard Algorithm with a step-by-step stack trace |
| Postfix Evaluation | Stack-based evaluator with per-step trace |
| Expression Tree | Binary tree canvas rendering built from postfix output |
| Stack Visualization | Animated canvas view of operator & evaluation stacks |
| Process Flowchart | SVG flowchart of the full compiler pipeline |
| Block Diagram | Animated compiler phase block diagram |
| Load Example | Cycles through 5 built-in example expressions |

---

## Technologies Used

- **HTML5** – Structure and layout
- **CSS3** – Responsive design, light-blue card theme
- **Vanilla JavaScript** – All compiler logic, canvas rendering, SVG generation
- **HTML5 Canvas** – Stack visualizations and expression tree
- **SVG** – Process flowchart

No frameworks, no libraries, no backend, no build tools.

---

## Folder Structure

```
Arithmetic-Expression-Evaluator/
├── index.html    ← Main HTML page
├── style.css     ← All styles (light-blue card theme)
├── script.js     ← Compiler logic + visualizations
└── README.md     ← This file
```

---

## How to Run

1. Download or unzip the project folder.
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
3. Type an arithmetic expression in the input field, or click **Load Example**.
4. Click **Analyze** (or press Enter).
5. Scroll down to explore:
   - Token table
   - Syntax validation results
   - Postfix conversion with stack trace
   - Evaluation trace and result
   - Animated stack visualizations (use Prev / Next / Auto Play)
   - Expression tree

No installation, no internet connection, no server required.

---

## Example Expressions

```
(5+3)*2 - 8/4
3 + 4 * 2 / (1 - 5)
(10 + 2) * 6 / (4 - 1)
100 / (5 * (2 + 3))
7 + (3 * (4 - 1)) / 9
```

---

## Compiler Design Concepts Demonstrated

| Concept | Implementation |
|---|---|
| Lexer / Scanner | `tokenize()` in script.js |
| Parser / Syntax Checker | `validateSyntax()` in script.js |
| Intermediate Representation | Postfix (RPN) expression |
| Shunting Yard Algorithm | `infixToPostfix()` in script.js |
| Stack-based Evaluation | `evaluatePostfix()` in script.js |
| Abstract Syntax Tree (AST) | `buildExprTree()` + canvas rendering |

 ## Author

S. Lakshmi Abhishiktha<br>
V. Mohana<br>
P. Chaitra Sree
