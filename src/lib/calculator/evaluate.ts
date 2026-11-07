import { tokenize } from "./tokenize.ts"
import {
  calcError,
  type AngleMode,
  type CalcError,
  type EvalResult,
  type FunctionName,
  type Operator,
  type Token,
} from "./types.ts"

type StackOp =
  | {
      kind: "operator"
      value: Operator | "u-"
      precedence: number
      rightAssoc: boolean
    }
  | { kind: "function"; value: FunctionName }
  | { kind: "lparen" }

const operatorInfo: Record<
  Operator | "u-",
  { precedence: number; rightAssoc: boolean }
> = {
  "!": { precedence: 5, rightAssoc: false },
  "%": { precedence: 5, rightAssoc: false },
  "^": { precedence: 4, rightAssoc: true },
  "u-": { precedence: 3, rightAssoc: true },
  "*": { precedence: 2, rightAssoc: false },
  "/": { precedence: 2, rightAssoc: false },
  "+": { precedence: 1, rightAssoc: false },
  "-": { precedence: 1, rightAssoc: false },
}

function fails(error: CalcError): EvalResult {
  return { ok: false, error }
}

function isUnaryPosition(previous: Token | undefined): boolean {
  if (!previous) return true
  if (previous.type === "lparen" || previous.type === "function") return true
  if (previous.type !== "operator") return false
  return previous.value !== "!" && previous.value !== "%"
}

function toRadians(value: number, mode: AngleMode): number {
  return mode === "deg" ? (value * Math.PI) / 180 : value
}

function fromRadians(value: number, mode: AngleMode): number {
  return mode === "deg" ? (value * 180) / Math.PI : value
}

function factorial(value: number): EvalResult {
  if (!Number.isInteger(value) || value < 0 || value > 170) {
    return fails(calcError.factorial)
  }
  let result = 1
  for (let i = 2; i <= value; i += 1) result *= i
  return { ok: true, value: result }
}

function applyFunction(
  name: FunctionName,
  value: number,
  mode: AngleMode,
): EvalResult {
  switch (name) {
    case "sin":
      return { ok: true, value: Math.sin(toRadians(value, mode)) }
    case "cos":
      return { ok: true, value: Math.cos(toRadians(value, mode)) }
    case "tan": {
      const radians = toRadians(value, mode)
      if (Math.abs(Math.cos(radians)) < 1e-12) return fails(calcError.tan)
      return { ok: true, value: Math.sin(radians) / Math.cos(radians) }
    }
    case "asin":
      if (value < -1 || value > 1) return fails(calcError.inverseTrig)
      return { ok: true, value: fromRadians(Math.asin(value), mode) }
    case "acos":
      if (value < -1 || value > 1) return fails(calcError.inverseTrig)
      return { ok: true, value: fromRadians(Math.acos(value), mode) }
    case "atan":
      return { ok: true, value: fromRadians(Math.atan(value), mode) }
    case "log":
      if (value <= 0) return fails(calcError.log)
      return { ok: true, value: Math.log10(value) }
    case "ln":
      if (value <= 0) return fails(calcError.log)
      return { ok: true, value: Math.log(value) }
    case "sqrt":
      if (value < 0) return fails(calcError.sqrt)
      return { ok: true, value: Math.sqrt(value) }
    case "abs":
      return { ok: true, value: Math.abs(value) }
    case "exp":
      return { ok: true, value: Math.exp(value) }
    default:
      return fails(calcError.invalid)
  }
}

function applyOperator(
  operator: Operator | "u-",
  stack: number[],
): EvalResult | undefined {
  if (operator === "u-" || operator === "!" || operator === "%") {
    const value = stack.pop()
    if (value === undefined) return fails(calcError.invalid)
    if (operator === "u-") {
      stack.push(-value)
      return
    }
    if (operator === "%") {
      stack.push(value / 100)
      return
    }
    const factored = factorial(value)
    if (!factored.ok) return factored
    stack.push(factored.value)
    return
  }

  const right = stack.pop()
  const left = stack.pop()
  if (right === undefined || left === undefined) return fails(calcError.invalid)

  if (operator === "/" && right === 0) return fails(calcError.divideByZero)

  const value =
    operator === "+"
      ? left + right
      : operator === "-"
        ? left - right
        : operator === "*"
          ? left * right
          : operator === "/"
            ? left / right
            : left ** right

  if (!Number.isFinite(value)) return fails(calcError.domain)
  stack.push(value)
}

function shouldPop(top: StackOp, next: StackOp): boolean {
  if (top.kind !== "operator" || next.kind !== "operator") return false
  if (top.precedence > next.precedence) return true
  return top.precedence === next.precedence && !next.rightAssoc
}

export function evaluate(expression: string, mode: AngleMode): EvalResult {
  if (expression.trim() === "") return fails(calcError.invalid)

  const tokenized = tokenize(expression)
  if (!tokenized.ok) return tokenized

  const output: Array<
    | { kind: "number"; value: number }
    | { kind: "operator"; value: Operator | "u-" }
    | { kind: "function"; value: FunctionName }
  > = []
  const operators: StackOp[] = []

  for (let index = 0; index < tokenized.tokens.length; index += 1) {
    const token = tokenized.tokens[index]
    const previous = tokenized.tokens[index - 1]

    if (token.type === "number") {
      output.push({ kind: "number", value: token.value })
      continue
    }

    if (token.type === "constant") {
      output.push({
        kind: "number",
        value: token.value === "pi" ? Math.PI : Math.E,
      })
      continue
    }

    if (token.type === "function") {
      operators.push({ kind: "function", value: token.value })
      continue
    }

    if (token.type === "lparen") {
      operators.push({ kind: "lparen" })
      continue
    }

    if (token.type === "rparen") {
      let found = false
      while (operators.length > 0) {
        const top = operators.pop()
        if (!top) break
        if (top.kind === "lparen") {
          found = true
          break
        }
        if (top.kind === "function") {
          output.push({ kind: "function", value: top.value })
          continue
        }
        output.push({ kind: "operator", value: top.value })
      }
      if (!found) return fails(calcError.parentheses)
      const top = operators.at(-1)
      if (top?.kind === "function") {
        operators.pop()
        output.push({ kind: "function", value: top.value })
      }
      continue
    }

    const unary = token.value === "-" && isUnaryPosition(previous)
    const info = operatorInfo[unary ? "u-" : token.value]
    const next: StackOp = {
      kind: "operator",
      value: unary ? "u-" : token.value,
      precedence: info.precedence,
      rightAssoc: info.rightAssoc,
    }

    if (!unary) {
      while (operators.length > 0 && shouldPop(operators[operators.length - 1], next)) {
        const top = operators.pop()
        if (!top || top.kind !== "operator") break
        output.push({ kind: "operator", value: top.value })
      }
    }
    operators.push(next)
  }

  while (operators.length > 0) {
    const top = operators.pop()
    if (!top || top.kind === "lparen") return fails(calcError.parentheses)
    if (top.kind === "function") {
      output.push({ kind: "function", value: top.value })
      continue
    }
    output.push({ kind: "operator", value: top.value })
  }

  const stack: number[] = []
  for (const item of output) {
    if (item.kind === "number") {
      stack.push(item.value)
      continue
    }
    if (item.kind === "function") {
      const value = stack.pop()
      if (value === undefined) return fails(calcError.invalid)
      const applied = applyFunction(item.value, value, mode)
      if (!applied.ok) return applied
      if (!Number.isFinite(applied.value)) return fails(calcError.domain)
      stack.push(applied.value)
      continue
    }
    const applied = applyOperator(item.value, stack)
    if (applied) return applied
  }

  if (stack.length !== 1) return fails(calcError.invalid)
  const value = stack[0]
  if (!Number.isFinite(value)) return fails(calcError.domain)
  return { ok: true, value: Math.abs(value) < 1e-12 ? 0 : value }
}
