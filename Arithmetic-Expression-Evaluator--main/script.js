/* =============================================
   ARITHMETIC EXPRESSION EVALUATOR — script.js
   Compiler Design Mini Project
   ============================================= */

'use strict';

/* ───────────────────────────────────────────
   CONSTANTS & STATE
─────────────────────────────────────────────*/
const EXAMPLES = [
  '(5+3)*2 - 8/4',
  '3 + 4 * 2 / (1 - 5)',
  '(10 + 2) * 6 / (4 - 1)',
  '100 / (5 * (2 + 3))',
  '7 + (3 * (4 - 1)) / 9',
];
let exampleIdx = 0;

// Animation state
let allSteps   = [];   // merged steps for visualization
let stepIndex  = 0;
let autoTimer  = null;

/* ───────────────────────────────────────────
   DOM REFS
─────────────────────────────────────────────*/
const exprInput     = document.getElementById('exprInput');
const btnAnalyze    = document.getElementById('btnAnalyze');
const btnExample    = document.getElementById('btnExample');
const btnClear      = document.getElementById('btnClear');
const resultsGrid   = document.getElementById('resultsGrid');
const tokenTbody    = document.querySelector('#tokenTable tbody');
const syntaxResult  = document.getElementById('syntaxResult');
const syntaxChecks  = document.getElementById('syntaxChecks');
const postfixDisplay= document.getElementById('postfixDisplay');
const stackTbody    = document.querySelector('#stackTable tbody');
const evalTbody     = document.querySelector('#evalTable tbody');
const finalResult   = document.getElementById('finalResult');
const stepLabel     = document.getElementById('stepLabel');
const btnPrev       = document.getElementById('btnPrevStep');
const btnNext       = document.getElementById('btnNextStep');
const btnAuto       = document.getElementById('btnAutoPlay');
const opCanvas      = document.getElementById('opStackCanvas');
const evCanvas      = document.getElementById('evalStackCanvas');
const treeCanvas    = document.getElementById('treeCanvas');

/* ───────────────────────────────────────────
   FLOWCHART (SVG)
─────────────────────────────────────────────*/
function buildFlowchart() {
  const svg = document.getElementById('flowchartSVG');
  const BLUE  = '#1a7fc1';
  const LBLUE = '#d0edfb';
  const GREEN = '#1a9a4a';
  const GBG   = '#e6f7ed';
  const W = 200, CX = 160;

  const nodes = [
    { label: 'START',              shape: 'oval',    y: 30,  fill: GREEN, text: '#fff' },
    { label: 'Input Expression',   shape: 'rect',    y: 100, fill: LBLUE, text: BLUE },
    { label: 'Lexical Analysis',   shape: 'rect',    y: 185, fill: LBLUE, text: BLUE },
    { label: 'Syntax Analysis',    shape: 'diamond', y: 280, fill: '#fff8e0', text: '#8a6000' },
    { label: 'Valid?',             shape: null,       y: 0 },
    { label: 'Infix → Postfix',    shape: 'rect',    y: 400, fill: LBLUE, text: BLUE },
    { label: 'Evaluate Postfix',   shape: 'rect',    y: 480, fill: LBLUE, text: BLUE },
    { label: 'Display Result',     shape: 'rect',    y: 560, fill: LBLUE, text: BLUE },
    { label: 'END',                shape: 'oval',    y: 640, fill: GREEN, text: '#fff' },
    { label: 'Error',              shape: 'rect',    y: 340, fill: '#fdecea', text: '#c0392b', x: CX + 95 },
  ];

  let markup = '';

  // Arrow helper
  const arrow = (x1,y1,x2,y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${BLUE}" stroke-width="1.8" marker-end="url(#arr)" />`;

  // Marker
  markup += `<defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 Z" fill="${BLUE}" />
    </marker>
  </defs>`;

  // Oval
  const oval = (cx,cy,label,fill,text) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="55" ry="20" fill="${fill}" stroke="${BLUE}" stroke-width="1.5"/>
     <text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="12" font-weight="700" fill="${text}" font-family="Segoe UI,sans-serif">${label}</text>`;

  // Rect
  const rect = (cx,cy,label,fill,text,w=W) =>
    `<rect x="${cx-w/2}" y="${cy-22}" width="${w}" height="44" rx="7" fill="${fill}" stroke="${BLUE}" stroke-width="1.5"/>
     <text x="${cx}" y="${cy+5}" text-anchor="middle" font-size="12" font-weight="600" fill="${text}" font-family="Segoe UI,sans-serif">${label}</text>`;

  // Diamond (Syntax check)
  const diamond = (cx,cy,label,fill,text) => {
    const dw=75, dh=36;
    return `<polygon points="${cx},${cy-dh} ${cx+dw},${cy} ${cx},${cy+dh} ${cx-dw},${cy}"
        fill="${fill}" stroke="#d4820a" stroke-width="1.5"/>
      <text x="${cx}" y="${cy-6}" text-anchor="middle" font-size="11" font-weight="600" fill="${text}" font-family="Segoe UI,sans-serif">${label}</text>
      <text x="${cx}" y="${cy+10}" text-anchor="middle" font-size="11" font-weight="600" fill="${text}" font-family="Segoe UI,sans-serif">Valid?</text>`;
  };

  // Draw arrows
  markup += arrow(CX,50,CX,78);      // start→input
  markup += arrow(CX,122,CX,163);    // input→lexical
  markup += arrow(CX,207,CX,244);    // lexical→syntax
  markup += arrow(CX,316,CX,378);    // syntax(yes)→postfix
  markup += arrow(CX,422,CX,458);    // postfix→eval
  markup += arrow(CX,502,CX,538);    // eval→display
  markup += arrow(CX,582,CX,618);    // display→end
  // error branch
  markup += arrow(CX+75,280,CX+112,280);
  markup += `<line x1="${CX+112}" y1="280" x2="${CX+112}" y2="340" stroke="${BLUE}" stroke-width="1.8"/>`;
  // Yes/No labels
  markup += `<text x="${CX+8}" y="328" font-size="10" fill="#1a9a4a" font-weight="700" font-family="Segoe UI,sans-serif">Yes</text>`;
  markup += `<text x="${CX+78}" y="272" font-size="10" fill="#c0392b" font-weight="700" font-family="Segoe UI,sans-serif">No</text>`;

  // Draw shapes
  markup += oval(CX,30,'START',GREEN,'#fff');
  markup += rect(CX,100,'Input Expression',LBLUE,BLUE);
  markup += rect(CX,185,'Lexical Analysis',LBLUE,BLUE);
  markup += diamond(CX,280,'Syntax Analysis','#fff8e0','#8a6000');
  markup += rect(CX,400,'Infix → Postfix',LBLUE,BLUE);
  markup += rect(CX,480,'Evaluate Postfix',LBLUE,BLUE);
  markup += rect(CX,560,'Display Result',LBLUE,BLUE);
  markup += oval(CX,640,'END',GREEN,'#fff');
  markup += rect(CX+112,340,'Show Error','#fdecea','#c0392b',90);

  svg.innerHTML = markup;
}

/* ───────────────────────────────────────────
   LEXICAL ANALYSIS
─────────────────────────────────────────────*/
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') { i++; continue; }
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(expr[i+1]||''))) {
      let num = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) num += expr[i++];
      tokens.push({ value: num, type: 'NUMBER' });
    } else if ('+-*/'.includes(ch)) {
      tokens.push({ value: ch, type: 'OPERATOR' });
      i++;
    } else if (ch === '(' || ch === ')') {
      tokens.push({ value: ch, type: 'PARENTHESIS' });
      i++;
    } else {
      tokens.push({ value: ch, type: 'UNKNOWN' });
      i++;
    }
  }
  return tokens;
}

function renderTokenTable(tokens) {
  tokenTbody.innerHTML = '';
  tokens.forEach((t, idx) => {
    const tr = document.createElement('tr');
    const badgeCls = t.type === 'NUMBER' ? 'badge-num'
                   : t.type === 'OPERATOR' ? 'badge-op'
                   : t.type === 'PARENTHESIS' ? 'badge-paren' : '';
    tr.innerHTML = `<td>${idx + 1}</td>
      <td><strong>${escHtml(t.value)}</strong></td>
      <td><span class="badge ${badgeCls}">${t.type}</span></td>`;
    tokenTbody.appendChild(tr);
  });
}

/* ───────────────────────────────────────────
   SYNTAX VALIDATION
─────────────────────────────────────────────*/
function validateSyntax(tokens) {
  const checks = [];
  let valid = true;

  // 1. Balanced parentheses
  let depth = 0, balanced = true;
  for (const t of tokens) {
    if (t.value === '(') depth++;
    else if (t.value === ')') { depth--; if (depth < 0) { balanced = false; break; } }
  }
  if (depth !== 0) balanced = false;
  checks.push({ ok: balanced, label: balanced ? 'Parentheses are balanced' : 'Unbalanced parentheses detected' });
  if (!balanced) valid = false;

  // 2. No unknown tokens
  const unknowns = tokens.filter(t => t.type === 'UNKNOWN');
  checks.push({ ok: unknowns.length === 0,
    label: unknowns.length === 0 ? 'No unknown/invalid characters' : `Unknown characters: ${unknowns.map(u=>u.value).join(', ')}` });
  if (unknowns.length) valid = false;

  // 3. No consecutive operators
  let consOp = false;
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i].type === 'OPERATOR' && tokens[i+1].type === 'OPERATOR') { consOp = true; break; }
  }
  checks.push({ ok: !consOp, label: consOp ? 'Consecutive operators detected' : 'No consecutive operators' });
  if (consOp) valid = false;

  // 4. Expression not empty
  const hasOperand = tokens.some(t => t.type === 'NUMBER');
  checks.push({ ok: hasOperand, label: hasOperand ? 'Expression contains operands' : 'No operands found' });
  if (!hasOperand) valid = false;

  // 5. Not starting/ending with operator
  const first = tokens[0], last = tokens[tokens.length - 1];
  const edgeOk = first && last &&
    first.type !== 'OPERATOR' && last.type !== 'OPERATOR';
  checks.push({ ok: edgeOk, label: edgeOk ? 'Expression starts and ends correctly' : 'Expression cannot start or end with an operator' });
  if (!edgeOk) valid = false;

  return { valid, checks };
}

function renderSyntax({ valid, checks }) {
  syntaxResult.className = 'syntax-box ' + (valid ? 'valid' : 'invalid');
  syntaxResult.textContent = valid ? '✔ Valid Expression' : '✘ Invalid Expression';
  syntaxChecks.innerHTML = '';
  checks.forEach(c => {
    const li = document.createElement('li');
    li.className = c.ok ? 'ok' : 'fail';
    li.textContent = (c.ok ? '✔ ' : '✘ ') + c.label;
    syntaxChecks.appendChild(li);
  });
}

/* ───────────────────────────────────────────
   INFIX → POSTFIX (Shunting Yard)
─────────────────────────────────────────────*/
const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2 };

function infixToPostfix(tokens) {
  const output = [];
  const opStack = [];
  const steps = [];

  const snap = (token, action) => {
    steps.push({
      token,
      action,
      stack: [...opStack],
      output: [...output],
    });
  };

  for (const t of tokens) {
    if (t.type === 'NUMBER') {
      output.push(t.value);
      snap(t.value, 'Push to output');
    } else if (t.type === 'OPERATOR') {
      while (
        opStack.length &&
        opStack[opStack.length-1] !== '(' &&
        PRECEDENCE[opStack[opStack.length-1]] >= PRECEDENCE[t.value]
      ) {
        const popped = opStack.pop();
        output.push(popped);
        snap(t.value, `Pop '${popped}' (higher/equal precedence) to output`);
      }
      opStack.push(t.value);
      snap(t.value, `Push operator '${t.value}' to stack`);
    } else if (t.value === '(') {
      opStack.push('(');
      snap('(', "Push '(' to stack");
    } else if (t.value === ')') {
      while (opStack.length && opStack[opStack.length-1] !== '(') {
        const popped = opStack.pop();
        output.push(popped);
        snap(')', `Pop '${popped}' to output`);
      }
      opStack.pop(); // remove '('
      snap(')', "Pop '(' from stack (discard)");
    }
  }

  while (opStack.length) {
    const popped = opStack.pop();
    output.push(popped);
    snap('(end)', `Pop remaining '${popped}' to output`);
  }

  return { postfix: output, steps };
}

function renderStackTable(steps) {
  stackTbody.innerHTML = '';
  steps.forEach((s, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}</td>
      <td>${escHtml(s.token)}</td>
      <td>${escHtml(s.action)}</td>
      <td>[${s.stack.join(', ')}]</td>
      <td>${s.output.join(' ')}</td>`;
    stackTbody.appendChild(tr);
  });
}

/* ───────────────────────────────────────────
   POSTFIX EVALUATION
─────────────────────────────────────────────*/
function evaluatePostfix(postfix) {
  const stack = [];
  const steps = [];

  for (const token of postfix) {
    if (!isNaN(Number(token))) {
      stack.push(Number(token));
      steps.push({ token, action: `Push ${token}`, stack: [...stack] });
    } else {
      const b = stack.pop(), a = stack.pop();
      let res;
      if (token === '+') res = a + b;
      else if (token === '-') res = a - b;
      else if (token === '*') res = a * b;
      else if (token === '/') res = a / b;
      stack.push(res);
      steps.push({ token, action: `${a} ${token} ${b} = ${res}`, stack: [...stack] });
    }
  }
  return { result: stack[0], steps };
}

function renderEvalTable(steps) {
  evalTbody.innerHTML = '';
  steps.forEach((s, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx+1}</td>
      <td>${escHtml(s.token)}</td>
      <td>${escHtml(s.action)}</td>
      <td>[${s.stack.join(', ')}]</td>`;
    evalTbody.appendChild(tr);
  });
}

/* ───────────────────────────────────────────
   STACK CANVAS VISUALIZATION
─────────────────────────────────────────────*/
function drawStackCanvas(canvas, stackArr, title) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const CELL_H = 38, CELL_W = 160, PX = (W - CELL_W) / 2;
  const MAX_VISIBLE = 6;
  const show = stackArr.slice(-MAX_VISIBLE);

  // Title
  ctx.fillStyle = '#1a7fc1';
  ctx.font = '700 12px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, W/2, 18);

  if (show.length === 0) {
    ctx.fillStyle = '#9ab';
    ctx.font = '12px Segoe UI, sans-serif';
    ctx.fillText('(empty)', W/2, H/2);
    return;
  }

  const startY = H - 30 - show.length * CELL_H;

  show.forEach((val, i) => {
    const y = startY + i * CELL_H;
    const isTop = i === show.length - 1;
    ctx.fillStyle = isTop ? '#1a7fc1' : '#d0edfb';
    ctx.strokeStyle = '#1a7fc1';
    ctx.lineWidth = 1.5;
    roundRect(ctx, PX, y, CELL_W, CELL_H - 4, 6);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = isTop ? '#fff' : '#1a2533';
    ctx.font = `${isTop ? '700' : '600'} 14px Cascadia Code, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(String(val), PX + CELL_W/2, y + CELL_H/2 + 1);

    if (isTop) {
      ctx.fillStyle = '#22b0e8';
      ctx.font = '10px Segoe UI, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('TOP', PX + CELL_W + 6, y + CELL_H/2 + 1);
      ctx.textAlign = 'center';
    }
  });

  // Base line
  const baseY = startY + show.length * CELL_H - 2;
  ctx.strokeStyle = '#1a7fc1';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(PX - 6, baseY);
  ctx.lineTo(PX + CELL_W + 6, baseY);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ───────────────────────────────────────────
   MERGED STEPS FOR ANIMATION
─────────────────────────────────────────────*/
function buildAllSteps(postfixSteps, evalSteps) {
  // For each postfix step: opStack = step.stack, evalStack = []
  // For each eval step: opStack = [], evalStack = step.stack
  const merged = [];
  postfixSteps.forEach(s => merged.push({ phase: 'postfix', opStack: s.stack, evalStack: [] }));
  evalSteps.forEach(s => merged.push({ phase: 'eval', opStack: [], evalStack: s.stack }));
  return merged;
}

function renderStep(idx) {
  if (!allSteps.length) return;
  const s = allSteps[idx];
  drawStackCanvas(opCanvas,   s.opStack,   'Operator Stack');
  drawStackCanvas(evCanvas,   s.evalStack, 'Eval Stack');
  stepLabel.textContent = `Step ${idx + 1} / ${allSteps.length}`;
}

function gotoStep(i) {
  stepIndex = Math.max(0, Math.min(allSteps.length - 1, i));
  renderStep(stepIndex);
}

/* ───────────────────────────────────────────
   EXPRESSION TREE
─────────────────────────────────────────────*/
class TreeNode {
  constructor(val) { this.val = val; this.left = null; this.right = null; }
}

function buildExprTree(postfix) {
  const stack = [];
  for (const tok of postfix) {
    if (!isNaN(Number(tok))) {
      stack.push(new TreeNode(tok));
    } else {
      const node = new TreeNode(tok);
      node.right = stack.pop();
      node.left  = stack.pop();
      stack.push(node);
    }
  }
  return stack[0] || null;
}

function treeDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
}

function drawTree(root) {
  if (!root) return;
  const depth = treeDepth(root);
  const W = Math.max(520, (Math.pow(2, depth) * 56));
  const H = depth * 80 + 60;
  treeCanvas.width  = W;
  treeCanvas.height = H;
  const ctx = treeCanvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  function draw(node, x, y, spread) {
    if (!node) return;
    const R = 22;
    const isOp = isNaN(Number(node.val));

    if (node.left) {
      const lx = x - spread, ly = y + 80;
      ctx.strokeStyle = '#90c8e8';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(x, y + R); ctx.lineTo(lx, ly - R); ctx.stroke();
      draw(node.left, lx, ly, spread / 2);
    }
    if (node.right) {
      const rx = x + spread, ry = y + 80;
      ctx.strokeStyle = '#90c8e8';
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(x, y + R); ctx.lineTo(rx, ry - R); ctx.stroke();
      draw(node.right, rx, ry, spread / 2);
    }

    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fillStyle = isOp ? '#1a7fc1' : '#d0edfb';
    ctx.fill();
    ctx.strokeStyle = isOp ? '#0e5a91' : '#1a7fc1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = isOp ? '#fff' : '#1a2533';
    ctx.font = `700 13px Cascadia Code, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.val, x, y);
  }

  draw(root, W / 2, 35, W / 4);
}

/* ───────────────────────────────────────────
   BLOCK DIAGRAM PHASE HIGHLIGHT
─────────────────────────────────────────────*/
function highlightPhase(id) {
  ['bp0','bp1','bp2','bp3','bp4','bp5'].forEach(b => {
    document.getElementById(b).classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}

function animatePhases() {
  const phases = ['bp0','bp1','bp2','bp3','bp4','bp5'];
  let i = 0;
  const iv = setInterval(() => {
    if (i >= phases.length) { clearInterval(iv); return; }
    highlightPhase(phases[i++]);
  }, 300);
}

/* ───────────────────────────────────────────
   MAIN ANALYZE
─────────────────────────────────────────────*/
function analyze() {
  stopAuto();
  const expr = exprInput.value.trim();
  if (!expr) {
    exprInput.focus();
    return;
  }

  // ── 1. Lexical
  const tokens = tokenize(expr);
  renderTokenTable(tokens);

  // ── 2. Syntax
  const syntaxRes = validateSyntax(tokens);
  renderSyntax(syntaxRes);

  // Show results area
  resultsGrid.style.display = 'grid';

  if (!syntaxRes.valid) {
    postfixDisplay.textContent = '—';
    stackTbody.innerHTML = '';
    evalTbody.innerHTML  = '';
    finalResult.textContent = 'Cannot evaluate: invalid expression.';
    finalResult.style.background = '#c0392b';
    allSteps = [];
    drawStackCanvas(opCanvas, [], 'Operator Stack');
    drawStackCanvas(evCanvas, [], 'Eval Stack');
    animatePhases();
    return;
  }

  // ── 3. Postfix
  const { postfix, steps: pSteps } = infixToPostfix(tokens);
  postfixDisplay.textContent = postfix.join(' ');
  renderStackTable(pSteps);

  // ── 4. Evaluate
  const { result, steps: eSteps } = evaluatePostfix(postfix);
  renderEvalTable(eSteps);
  const disp = Number.isInteger(result) ? result : parseFloat(result.toFixed(6));
  finalResult.textContent = `Result = ${disp}`;
  finalResult.style.background = '';

  // ── 5. Tree
  const root = buildExprTree(postfix);
  drawTree(root);

  // ── 6. Stack visualization
  allSteps = buildAllSteps(pSteps, eSteps);
  stepIndex = 0;
  renderStep(0);

  // ── 7. Animate phases
  animatePhases();
}

/* ───────────────────────────────────────────
   AUTO-PLAY
─────────────────────────────────────────────*/
function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  btnAuto.textContent = '▶ Auto Play';
}

function startAuto() {
  autoTimer = setInterval(() => {
    if (stepIndex >= allSteps.length - 1) { stopAuto(); return; }
    gotoStep(++stepIndex);
  }, 600);
  btnAuto.textContent = '⏹ Stop';
}

/* ───────────────────────────────────────────
   HELPERS
─────────────────────────────────────────────*/
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ───────────────────────────────────────────
   EVENT LISTENERS
─────────────────────────────────────────────*/
btnAnalyze.addEventListener('click', analyze);
exprInput.addEventListener('keydown', e => { if (e.key === 'Enter') analyze(); });

btnExample.addEventListener('click', () => {
  exprInput.value = EXAMPLES[exampleIdx % EXAMPLES.length];
  exampleIdx++;
});

btnClear.addEventListener('click', () => {
  stopAuto();
  exprInput.value = '';
  resultsGrid.style.display = 'none';
  ['bp0','bp1','bp2','bp3','bp4','bp5'].forEach(b =>
    document.getElementById(b).classList.remove('active'));
  exprInput.focus();
});

btnPrev.addEventListener('click', () => { stopAuto(); gotoStep(stepIndex - 1); });
btnNext.addEventListener('click', () => { stopAuto(); gotoStep(stepIndex + 1); });
btnAuto.addEventListener('click', () => {
  if (autoTimer) stopAuto();
  else { if (stepIndex >= allSteps.length - 1) stepIndex = 0; startAuto(); }
});

/* ───────────────────────────────────────────
   INIT
─────────────────────────────────────────────*/
buildFlowchart();
drawStackCanvas(opCanvas, [], 'Operator Stack');
drawStackCanvas(evCanvas, [], 'Eval Stack');
