export type AngleMode = "deg" | "rad"

export type CalcErrorCode =
  | "invalid"
  | "divide-by-zero"
  | "domain"
  | "parentheses"

export type CalcError = {
  code: CalcErrorCode
  message: string
}

export const calcError = {
  invalid: { code: "invalid", message: "Expressão inválida" },
  divideByZero: { code: "divide-by-zero", message: "Divisão por zero" },
  parentheses: { code: "parentheses", message: "Parênteses desbalanceados" },
  log: { code: "domain", message: "Logaritmo indefinido" },
  sqrt: { code: "domain", message: "Raiz de número negativo" },
  inverseTrig: { code: "domain", message: "Fora do domínio" },
  tan: { code: "domain", message: "Tangente indefinida" },
  factorial: { code: "domain", message: "Fatorial indefinido" },
  domain: { code: "domain", message: "Fora do domínio" },
} as const satisfies Record<string, CalcError>

export const functionNames = [
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "log",
  "ln",
  "sqrt",
  "abs",
  "exp",
] as const

export type FunctionName = (typeof functionNames)[number]

export type ConstantName = "pi" | "e"

export type Operator = "+" | "-" | "*" | "/" | "^" | "%" | "!"

export type Token =
  | { type: "number"; raw: string; value: number }
  | { type: "operator"; raw: string; value: Operator }
  | { type: "function"; raw: string; value: FunctionName }
  | { type: "constant"; raw: string; value: ConstantName }
  | { type: "lparen"; raw: "(" }
  | { type: "rparen"; raw: ")" }

export type TokenizeResult =
  | { ok: true; tokens: Token[] }
  | { ok: false; error: CalcError }

export type EvalResult =
  | { ok: true; value: number }
  | { ok: false; error: CalcError }
