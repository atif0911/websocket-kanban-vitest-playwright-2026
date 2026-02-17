/* eslint-disable sonarjs/no-nested-conditional */
/* eslint-disable sonarjs/no-all-duplicated-branches */
import fs from "fs";
import path from "path";
import { parse } from "@typescript-eslint/parser";
import { simpleTraverse } from "@typescript-eslint/typescript-estree";

/* -----------------------------
   CONFIG
------------------------------ */
const SRC_DIR = path.resolve("./");
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

/* -----------------------------
   HALSTEAD TOKENIZER + RADON SCORES
------------------------------ */
const OPERATORS = new Set([
  // Assignment/Arithmetic
  "=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**=",
  "<<=",
  ">>=",
  "&=",
  "^=",
  "|=",
  "&&=",
  "||=",
  "??=",
  "==",
  "!=",
  "===",
  "!==",
  ">",
  "<",
  ">=",
  "<=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "**",
  "<<",
  ">>",
  "&",
  "^",
  "|",
  "&&",
  "||",
  "??",
  "!",
  // Keywords (control, declarations)
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "default",
  "try",
  "catch",
  "finally",
  "throw",
  "return",
  "break",
  "continue",
  "function",
  "const",
  "let",
  "var",
  "async",
  "await",
  "new",
  "typeof",
  "instanceof",
  "in",
  "delete",
  // Punctuation
  "{",
  "}",
  "(",
  ")",
  "[",
  "]",
  ",",
  ";",
  ":",
  "?",
  ".",
  "=>",
]);

function tokenizeHalstead(code) {
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    const ch = code[i];

    // Skip whitespace/comments roughly
    if (
      /\s/.test(ch) ||
      (ch === "/" && (code[i + 1] === "/" || code[i + 1] === "*"))
    ) {
      if (ch === "/" && code[i + 1] === "/") {
        i += code.indexOf("\n", i) - i + 1;
        continue;
      }
      if (ch === "/" && code[i + 1] === "*") {
        i += code.indexOf("*/", i) - i + 2;
        continue;
      }
      i++;
      continue;
    }

    // Keywords/operators first
    let matched = false;
    for (const op of OPERATORS) {
      if (code.startsWith(op, i)) {
        tokens.push(op);
        i += op.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Identifiers/literals/numbers/strings
    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      tokens.push(code.slice(i, j));
      i = j;
      continue;
    } else if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < code.length && /[0-9.]/.test(code[j])) j++;
      tokens.push(code.slice(i, j));
      i = j;
      continue;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < code.length && code[j] !== ch) {
        if (code[j] === "\\") j += 2;
        else j++;
      }
      tokens.push(code.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    i++;
  }

  return tokens;
}

function calculateHalstead(tokens) {
  const opSet = new Set();
  const operandSet = new Set();
  let n1 = 0,
    n2 = 0,
    N1 = 0,
    N2 = 0;

  for (const t of tokens) {
    if (OPERATORS.has(t)) {
      N1++;
      if (!opSet.has(t)) {
        opSet.add(t);
        n1++;
      }
    } else {
      N2++;
      if (!operandSet.has(t)) {
        operandSet.add(t);
        n2++;
      }
    }
  }

  const n = n1 + n2;
  const N = N1 + N2;
  const volume = N > 0 ? N * Math.log2(n) : 0;

  // RADON-STYLE EFFORT & BUGS (matching your formula)
  const difficulty = (n1 / 2) * (N2 / n2 || 0);
  const effortRaw = difficulty * (Math.pow(volume, 20 / 100) / 2);
  const bugsRaw = volume / 3000;

  // Normalize 0-10 using your equation: (1 - (X-min)/(max-min)) * 10
  const effortScore = Math.max(
    0,
    Math.min(10, (1 - (effortRaw - 100) / (20000 - 100)) * 10),
  );
  const bugsScore = Math.max(
    0,
    Math.min(10, (1 - (bugsRaw - 0) / (1 - 0)) * 10),
  );

  return {
    n1,
    n2,
    N1,
    N2,
    volume,
    n,
    N,
    effortRaw,
    bugsRaw,
    effortScore,
    bugsScore,
  };
}

/* -----------------------------
   FILE DISCOVERY
------------------------------ */
function getAllFiles(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else if (EXTENSIONS.includes(path.extname(item))) {
      files.push(fullPath);
    }
  }
  return files;
}

/* -----------------------------
   FIXED CORE METRICS (McCabe + Nesting)
------------------------------ */
function analyzeFunction(node, code) {
  let cc = 1;
  let maxNesting = 0;
  let currentNesting = 0;
  let halsteadTokens = [];

  // Block-based decisions for CC/nesting (McCabe predicates)
  const decisionNodesCC = new Set([
    "IfStatement",
    "ForStatement",
    "WhileStatement",
    "DoWhileStatement",
    "ForInStatement",
    "ForOfStatement",
    "SwitchStatement",
    "CatchClause",
  ]);

  // Nesting structures (only those with blocks/bodies)
  const nestingNodes = new Set([
    "IfStatement",
    "ForStatement",
    "WhileStatement",
    "DoWhileStatement",
    "ForInStatement",
    "ForOfStatement",
    "SwitchStatement",
    "TryStatement",
    "CatchClause",
  ]);

  simpleTraverse(node, {
    enter(n) {
      // CC: predicate nodes
      if (decisionNodesCC.has(n.type)) {
        cc++;
      } else if (n.type === "LogicalExpression") {
        cc += 1;
      } else if (n.type === "ConditionalExpression") {
        cc++;
      }

      // Nesting: only block-containing
      if (nestingNodes.has(n.type)) {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      }

      // Collect tokens for Halstead (node range)
      if (n.range) {
        const snippet = code.slice(n.range[0], n.range[1]);
        halsteadTokens.push(...tokenizeHalstead(snippet));
      }
    },
    leave(n) {
      if (nestingNodes.has(n.type)) {
        currentNesting--;
      }
    },
  });

  const funcLines = code.slice(node.range[0], node.range[1]).split("\n").length;
  const halstead = calculateHalstead(halsteadTokens);

  return {
    cc,
    maxNesting,
    halstead,
    func_loc: funcLines,
  };
}

/* -----------------------------
   FULL MI (SEI CERT Formula)
------------------------------ */
function calculateMI(V, CC, LOC, percentComments = 0) {
  if (LOC === 0) return 100;

  const baseMI = 171 - 5.2 * Math.log(V) - 0.23 * CC - 16.2 * Math.log(LOC);
  const commentAdjust = 50 * Math.sin(Math.sqrt(2.4 * percentComments));

  return Math.max(0, Math.min(100, Math.round(baseMI + commentAdjust)));
}

/* -----------------------------
   MAIN ANALYSIS
------------------------------ */
const files = getAllFiles(SRC_DIR);

const functions = [];
let totalLOC = 0;
let totalComments = 0;
let totalHalsteadV = 0;
let totalEffortScore = 0;
let totalBugsScore = 0;

for (const file of files) {
  const code = fs.readFileSync(file, "utf-8");
  const lines = code.split("\n");
  const loc = lines.length;
  let commentLines = 0;

  // Rough comment count
  for (const line of lines) {
    if (/^\s*(\/\/|\/\*|\*)/.test(line.trim())) commentLines++;
  }
  totalComments += commentLines;
  totalLOC += loc;

  const ast = parse(code, {
    ecmaVersion: 2022,
    sourceType: "module",
    jsx: true,
  });

  simpleTraverse(ast, {
    enter(node) {
      if (
        node.type === "FunctionDeclaration" ||
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression"
      ) {
        const metrics = analyzeFunction(node, code);

        functions.push({
          file,
          line: node.loc?.start.line ?? null,
          cyclomatic_complexity: metrics.cc,
          max_nesting_depth: metrics.maxNesting,
          halstead_volume: metrics.halstead.volume,
          radon_effort_score: Number(metrics.halstead.effortScore.toFixed(1)),
          radon_bugs_score: Number(metrics.halstead.bugsScore.toFixed(1)),
          func_loc: metrics.func_loc,
        });

        totalHalsteadV += metrics.halstead.volume;
        totalEffortScore += metrics.halstead.effortScore;
        totalBugsScore += metrics.halstead.bugsScore;
      }
    },
  });
}

/* -----------------------------
   AGGREGATION
------------------------------ */
const totalFunctions = functions.length;
const avgCC =
  totalFunctions === 0
    ? 0
    : functions.reduce((s, f) => s + f.cyclomatic_complexity, 0) /
      totalFunctions;
const avgHalsteadV = totalFunctions === 0 ? 0 : totalHalsteadV / totalFunctions;
const avgEffortScore =
  totalFunctions === 0 ? 0 : totalEffortScore / totalFunctions;
const avgBugsScore = totalFunctions === 0 ? 0 : totalBugsScore / totalFunctions;
const percentComments = totalLOC > 0 ? (totalComments / totalLOC) * 100 : 0;
const mi = calculateMI(avgHalsteadV, avgCC, totalLOC, percentComments);

const maxCC = Math.max(1, ...functions.map((f) => f.cyclomatic_complexity));
const maxNesting = Math.max(1, ...functions.map((f) => f.max_nesting_depth));

/* -----------------------------
   OUTPUT (Radon + SEI Complete)
------------------------------ */
const report = {
  summary: {
    total_files: files.length,
    total_functions: totalFunctions,
    total_loc: totalLOC,
    total_comment_percent: Number(percentComments.toFixed(1)),
    avg_cyclomatic_complexity: Number(avgCC.toFixed(2)),
    avg_halstead_volume: Number(avgHalsteadV.toFixed(0)),
    avg_radon_effort_score: Number(avgEffortScore.toFixed(1)),
    avg_radon_bugs_score: Number(avgBugsScore.toFixed(1)),
    max_cyclomatic_complexity: maxCC,
    max_nesting_depth: maxNesting,
    maintainability_index: mi,
    maintainability_grade:
      mi >= 85 ? "A" : mi >= 70 ? "B" : mi >= 55 ? "C" : "D",
  },
  hotspots: functions.filter(
    (f) => f.cyclomatic_complexity >= 15 || f.max_nesting_depth >= 5,
  ),
  functions,
};

fs.writeFileSync(
  "maintainability-report.json",
  JSON.stringify(report, null, 2),
);
console.log(
  "✅ COMPLETE Radon HAL + McCabe/SEI report → maintainability-report.json",
);
