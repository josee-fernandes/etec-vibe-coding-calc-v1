import { evaluate } from "./evaluate.ts"
import { formatNumber } from "./format.ts"
import { tokenize } from "./tokenize.ts"
import {
  calcError,
  type AngleMode,
  type FunctionName,
  type Token,
} from "./types.ts"

export type BinaryOperator = "+" | "-" | "*" | "/" | "^"

export type CalculatorAction =
  | { type: "digit"; digit: string }
  | { type: "dot" }
  | { type: "operator"; operator: BinaryOperator }
  | { type: "function"; name: FunctionName }
  | { type: "constant"; name: "pi" | "e" }
  | { type: "paren"; side?: "open" | "close" }
  | { type: "percent" }
  | { type: "square" }
  | { type: "reciprocal" }
  | { type: "factorial" }
  | { type: "backspace" }
  | { type: "clear" }
  | { type: "equals" }
  | { type: "mode"; mode: AngleMode }

export type CalculatorState = {
  expression: string
  formula: string
  angleMode: AngleMode
  committed: boolean
  error: string | null
  preview: string | null
}

export const initialCalculatorState: CalculatorState = {
  expression: "",
  formula: "",
  angleMode: "deg",
  committed: false,
  error: null,
  preview: null,
}

function readTokens(expression: string): Token[] | null {
  const tokenized = tokenize(expression)
  return tokenized.ok ? tokenized.tokens : null
}

function join(tokens: Token[]): string {
  return tokens.map((token) => token.raw).join("")
}

function endsWithValue(tokens: Token[]): boolean {
  const last = tokens.at(-1)
  if (!last) return false
  if (last.type === "number" || last.type === "constant" || last.type === "rparen") {
    return true
  }
  return last.type === "operator" && (last.value === "!" || last.value === "%")
}

function isBinaryOperator(token: Token): boolean {
  return (
    token.type === "operator" &&
    token.value !== "!" &&
    token.value !== "%"
  )
}

function openCount(tokens: Token[]): number {
  return tokens.reduce((count, token) => {
    if (token.type === "lparen") return count + 1
    if (token.type === "rparen") return count - 1
    return count
  }, 0)
}

function refresh(state: CalculatorState): CalculatorState {
  if (!state.expression) return { ...state, preview: null }
  const result = evaluate(state.expression, state.angleMode)
  if (!result.ok) return state
  return { ...state, preview: formatNumber(result.value) }
}

function replaceExpression(state: CalculatorState, expression: string): CalculatorState {
  return refresh({
    ...state,
    expression,
    formula: expression,
    committed: false,
    error: null,
  })
}

export function splitLastValue(
  expression: string,
): { prefix: string; value: string } | null {
  const tokens = readTokens(expression)
  if (!tokens || tokens.length === 0) return null

  let start = tokens.length
  while (start > 0) {
    const token = tokens[start - 1]
    if (
      token.type === "operator" &&
      (token.value === "!" || token.value === "%")
    ) {
      start -= 1
      continue
    }
    break
  }
  if (start === 0) return null

  const last = tokens[start - 1]
  if (last.type === "number" || last.type === "constant") {
    start -= 1
  } else if (last.type === "rparen") {
    let depth = 0
    let index = start - 1
    for (; index >= 0; index -= 1) {
      if (tokens[index].type === "rparen") depth += 1
      else if (tokens[index].type === "lparen") {
        depth -= 1
        if (depth === 0) break
      }
    }
    if (index < 0) return null
    if (index > 0 && tokens[index - 1].type === "function") index -= 1
    start = index
  } else {
    return null
  }

  return {
    prefix: join(tokens.slice(0, start)),
    value: join(tokens.slice(start)),
  }
}

function wrapLast(
  state: CalculatorState,
  wrap: (value: string) => string,
): CalculatorState {
  const parts = splitLastValue(state.expression)
  if (!parts) return state
  return replaceExpression(state, parts.prefix + wrap(parts.value))
}

function insertText(state: CalculatorState, text: string): CalculatorState {
  if (state.committed) return replaceExpression(state, text)
  const tokens = readTokens(state.expression) ?? []
  if (endsWithValue(tokens)) {
    return replaceExpression(state, `${state.expression}*${text}`)
  }
  return replaceExpression(state, state.expression + text)
}

function inputDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.committed) return replaceExpression(state, digit)
  const tokens = readTokens(state.expression) ?? []
  const last = tokens.at(-1)
  if (last?.type === "number") {
    return replaceExpression(state, state.expression + digit)
  }
  if (endsWithValue(tokens)) {
    return replaceExpression(state, `${state.expression}*${digit}`)
  }
  return replaceExpression(state, state.expression + digit)
}

function inputDot(state: CalculatorState): CalculatorState {
  if (state.committed) return replaceExpression(state, "0.")
  const tokens = readTokens(state.expression) ?? []
  const last = tokens.at(-1)
  if (last?.type === "number") {
    if (last.raw.includes(".")) return state
    return replaceExpression(state, `${state.expression}.`)
  }
  if (endsWithValue(tokens)) return replaceExpression(state, `${state.expression}*0.`)
  return replaceExpression(state, `${state.expression}0.`)
}

function inputOperator(
  state: CalculatorState,
  operator: BinaryOperator,
): CalculatorState {
  if (state.committed) return replaceExpression(state, state.expression + operator)
  const tokens = readTokens(state.expression)
  if (!tokens || tokens.length === 0) {
    return operator === "-" ? replaceExpression(state, "-") : state
  }

  const last = tokens[tokens.length - 1]
  if (isBinaryOperator(last)) {
    const previous = tokens[tokens.length - 2]
    const unaryMinus =
      last.type === "operator" &&
      last.value === "-" &&
      (!previous ||
        previous.type === "lparen" ||
        previous.type === "function" ||
        isBinaryOperator(previous))

    if (unaryMinus) {
      if (operator === "-" || !previous || !isBinaryOperator(previous)) return state
      return replaceExpression(state, join(tokens.slice(0, -2)) + operator)
    }

    if (operator === "-") return replaceExpression(state, `${state.expression}-`)
    return replaceExpression(state, join(tokens.slice(0, -1)) + operator)
  }

  if (last.type === "lparen" || last.type === "function") {
    return operator === "-" ? replaceExpression(state, `${state.expression}-`) : state
  }

  return replaceExpression(state, state.expression + operator)
}

function inputParen(
  state: CalculatorState,
  side?: "open" | "close",
): CalculatorState {
  if (state.committed) {
    return side === "close" ? state : replaceExpression(state, "(")
  }

  const tokens = readTokens(state.expression) ?? []
  const canClose = openCount(tokens) > 0 && endsWithValue(tokens)
  const shouldClose = side === "close" || (side !== "open" && canClose)
  if (shouldClose) {
    return canClose ? replaceExpression(state, `${state.expression})`) : state
  }
  return insertText(state, "(")
}

export function deleteLastEdit(expression: string): string {
  const tokens = readTokens(expression)
  if (!tokens) return expression.slice(0, -1)
  if (tokens.length === 0) return ""

  const last = tokens[tokens.length - 1]
  if (last.type === "number" && last.raw.length > 1) {
    const shortened = last.raw.slice(0, -1)
    const incomplete =
      shortened === "." ||
      shortened.endsWith("e") ||
      shortened.endsWith("e+") ||
      shortened.endsWith("e-")
    if (incomplete) {
      const coefficient = shortened.split("e")[0]?.replace(/\.$/, "")
      if (!coefficient) return join(tokens.slice(0, -1))
      return join(tokens.slice(0, -1)) + coefficient
    }
    return join(tokens.slice(0, -1)) + shortened
  }

  return join(tokens.slice(0, -1))
}

function setMode(state: CalculatorState, mode: AngleMode): CalculatorState {
  if (state.angleMode === mode) return state
  const next = { ...state, angleMode: mode, error: null }
  if (state.committed && state.formula) {
    const result = evaluate(state.formula, mode)
    if (!result.ok) return { ...next, error: result.error.message }
    const formatted = formatNumber(result.value)
    return { ...next, expression: formatted, preview: formatted }
  }
  return refresh(next)
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case "digit":
      return inputDigit(state, action.digit)
    case "dot":
      return inputDot(state)
    case "operator":
      return inputOperator(state, action.operator)
    case "function":
      return insertText(state, `${action.name}(`)
    case "constant":
      return insertText(state, action.name)
    case "paren":
      return inputParen(state, action.side)
    case "percent":
      return wrapLast(state, (value) => `${value}%`)
    case "square":
      return wrapLast(state, (value) => `${value}^(2)`)
    case "reciprocal":
      return wrapLast(state, (value) => `1/(${value})`)
    case "factorial":
      return wrapLast(state, (value) => `${value}!`)
    case "backspace":
      if (!state.expression) return { ...state, error: null, preview: null }
      return replaceExpression(state, deleteLastEdit(state.expression))
    case "clear":
      return { ...initialCalculatorState, angleMode: state.angleMode }
    case "equals": {
      if (!state.expression) return { ...state, error: calcError.invalid.message }
      const result = evaluate(state.expression, state.angleMode)
      if (!result.ok) {
        return { ...state, error: result.error.message, committed: false }
      }
      const formatted = formatNumber(result.value)
      return {
        ...state,
        formula: state.expression,
        expression: formatted,
        committed: true,
        error: null,
        preview: formatted,
      }
    }
    case "mode":
      return setMode(state, action.mode)
    default:
      return state
  }
}
