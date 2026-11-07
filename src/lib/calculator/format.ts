import { tokenize } from "./tokenize.ts"
import type { Token } from "./types.ts"

const functionSymbols: Record<string, string> = {
  sqrt: "√",
}

function isUnaryMinus(token: Token, previous: Token | undefined): boolean {
  if (token.type !== "operator" || token.value !== "-") return false
  if (!previous) return true
  if (previous.type === "lparen" || previous.type === "function") return true
  if (previous.type !== "operator") return false
  return previous.value !== "!" && previous.value !== "%"
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "Erro"
  const snapped = Math.abs(value) < 1e-12 ? 0 : value
  const absolute = Math.abs(snapped)

  if (absolute !== 0 && (absolute >= 1e12 || absolute < 1e-6)) {
    const [coefficient, exponent = "0"] = snapped.toExponential(11).split("e")
    const trimmed = coefficient.replace(/\.?0+$/, "")
    const power = Number(exponent)
    return `${trimmed}e${power >= 0 ? "+" : ""}${power}`
  }

  const precise = Number(snapped.toPrecision(12))
  return Object.is(precise, -0) ? "0" : precise.toString()
}

export function formatExpression(expression: string): string {
  if (!expression) return ""
  const tokenized = tokenize(expression)
  if (!tokenized.ok) return expression

  let formatted = ""
  for (let index = 0; index < tokenized.tokens.length; index += 1) {
    const token = tokenized.tokens[index]
    const previous = tokenized.tokens[index - 1]

    if (token.type === "number") {
      formatted += token.raw
      continue
    }

    if (token.type === "constant") {
      formatted += token.value === "pi" ? "π" : "e"
      continue
    }

    if (token.type === "function") {
      formatted += functionSymbols[token.value] ?? token.value
      continue
    }

    if (token.type === "lparen" || token.type === "rparen") {
      formatted += token.raw
      continue
    }

    if (token.value === "!" || token.value === "%") {
      formatted += token.value
      continue
    }

    if (isUnaryMinus(token, previous)) {
      formatted += "−"
      continue
    }

    const symbol =
      token.value === "*" ? "×" : token.value === "/" ? "÷" : token.value === "-" ? "−" : token.value
    formatted += ` ${symbol} `
  }

  return formatted
}
