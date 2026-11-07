import {
  calcError,
  functionNames,
  type ConstantName,
  type FunctionName,
  type Operator,
  type Token,
  type TokenizeResult,
} from "./types.ts"

const functions = new Set<string>(functionNames)

const numberPattern = /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/

function isOperator(char: string): char is Operator {
  return (
    char === "+" ||
    char === "-" ||
    char === "*" ||
    char === "/" ||
    char === "^" ||
    char === "%" ||
    char === "!"
  )
}

export function tokenize(expression: string): TokenizeResult {
  const tokens: Token[] = []
  let index = 0

  while (index < expression.length) {
    const char = expression[index]

    if (char === " " || char === "\t") {
      index += 1
      continue
    }

    if (char === "(") {
      tokens.push({ type: "lparen", raw: "(" })
      index += 1
      continue
    }

    if (char === ")") {
      tokens.push({ type: "rparen", raw: ")" })
      index += 1
      continue
    }

    if (isOperator(char)) {
      tokens.push({ type: "operator", raw: char, value: char })
      index += 1
      continue
    }

    if ((char >= "0" && char <= "9") || char === ".") {
      const match = numberPattern.exec(expression.slice(index))
      if (!match) return { ok: false, error: calcError.invalid }
      const raw = match[0]
      const value = Number(raw)
      if (!Number.isFinite(value)) return { ok: false, error: calcError.invalid }
      tokens.push({ type: "number", raw, value })
      index += raw.length
      continue
    }

    if ((char >= "a" && char <= "z") || (char >= "A" && char <= "Z")) {
      let end = index + 1
      while (end < expression.length && /[a-zA-Z]/.test(expression[end])) end += 1
      const raw = expression.slice(index, end)
      const name = raw.toLowerCase()
      if (functions.has(name)) {
        tokens.push({ type: "function", raw, value: name as FunctionName })
        index = end
        continue
      }
      if (name === "pi" || name === "e") {
        tokens.push({ type: "constant", raw, value: name as ConstantName })
        index = end
        continue
      }
      return { ok: false, error: calcError.invalid }
    }

    return { ok: false, error: calcError.invalid }
  }

  return { ok: true, tokens }
}
