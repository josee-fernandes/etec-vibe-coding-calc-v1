import type { CalculatorAction } from "@/lib/calculator/state.ts"

export type KeyVariant = "default" | "secondary" | "outline" | "destructive"

export type KeyDefinition = {
  id: string
  label: string
  action: CalculatorAction
  variant: KeyVariant
  ariaLabel: string
  row?: number
  col?: number
  rowSpan?: number
  colSpan?: number
}

export const scientificKeys: KeyDefinition[] = [
  { id: "sin", label: "sin", action: { type: "function", name: "sin" }, variant: "outline", ariaLabel: "Seno" },
  { id: "cos", label: "cos", action: { type: "function", name: "cos" }, variant: "outline", ariaLabel: "Cosseno" },
  { id: "tan", label: "tan", action: { type: "function", name: "tan" }, variant: "outline", ariaLabel: "Tangente" },
  { id: "asin", label: "asin", action: { type: "function", name: "asin" }, variant: "outline", ariaLabel: "Arco seno" },
  { id: "acos", label: "acos", action: { type: "function", name: "acos" }, variant: "outline", ariaLabel: "Arco cosseno" },
  { id: "atan", label: "atan", action: { type: "function", name: "atan" }, variant: "outline", ariaLabel: "Arco tangente" },
  { id: "log", label: "log", action: { type: "function", name: "log" }, variant: "outline", ariaLabel: "Logaritmo decimal" },
  { id: "ln", label: "ln", action: { type: "function", name: "ln" }, variant: "outline", ariaLabel: "Logaritmo natural" },
  { id: "sqrt", label: "√", action: { type: "function", name: "sqrt" }, variant: "outline", ariaLabel: "Raiz quadrada" },
  { id: "square", label: "x²", action: { type: "square" }, variant: "outline", ariaLabel: "Elevar ao quadrado" },
  { id: "reciprocal", label: "1/x", action: { type: "reciprocal" }, variant: "outline", ariaLabel: "Inverso" },
  { id: "factorial", label: "n!", action: { type: "factorial" }, variant: "outline", ariaLabel: "Fatorial" },
  { id: "pi", label: "π", action: { type: "constant", name: "pi" }, variant: "outline", ariaLabel: "Pi" },
  { id: "e", label: "e", action: { type: "constant", name: "e" }, variant: "outline", ariaLabel: "Número de Euler" },
  { id: "abs", label: "abs", action: { type: "function", name: "abs" }, variant: "outline", ariaLabel: "Valor absoluto" },
  { id: "exp", label: "exp", action: { type: "function", name: "exp" }, variant: "outline", ariaLabel: "Exponencial" },
  { id: "paren", label: "( )", action: { type: "paren" }, variant: "outline", ariaLabel: "Parênteses" },
  { id: "percent", label: "%", action: { type: "percent" }, variant: "outline", ariaLabel: "Porcento" },
  { id: "power", label: "^", action: { type: "operator", operator: "^" }, variant: "outline", ariaLabel: "Potência" },
]

export const numericKeys: KeyDefinition[] = [
  { id: "clear", label: "AC", action: { type: "clear" }, variant: "destructive", ariaLabel: "Limpar", row: 1, col: 1 },
  { id: "backspace", label: "Apagar", action: { type: "backspace" }, variant: "outline", ariaLabel: "Apagar", row: 1, col: 2 },
  { id: "divide", label: "÷", action: { type: "operator", operator: "/" }, variant: "secondary", ariaLabel: "Dividir", row: 1, col: 3 },
  { id: "multiply", label: "×", action: { type: "operator", operator: "*" }, variant: "secondary", ariaLabel: "Multiplicar", row: 1, col: 4 },
  { id: "7", label: "7", action: { type: "digit", digit: "7" }, variant: "secondary", ariaLabel: "7", row: 2, col: 1 },
  { id: "8", label: "8", action: { type: "digit", digit: "8" }, variant: "secondary", ariaLabel: "8", row: 2, col: 2 },
  { id: "9", label: "9", action: { type: "digit", digit: "9" }, variant: "secondary", ariaLabel: "9", row: 2, col: 3 },
  { id: "minus", label: "−", action: { type: "operator", operator: "-" }, variant: "secondary", ariaLabel: "Subtrair", row: 2, col: 4 },
  { id: "4", label: "4", action: { type: "digit", digit: "4" }, variant: "secondary", ariaLabel: "4", row: 3, col: 1 },
  { id: "5", label: "5", action: { type: "digit", digit: "5" }, variant: "secondary", ariaLabel: "5", row: 3, col: 2 },
  { id: "6", label: "6", action: { type: "digit", digit: "6" }, variant: "secondary", ariaLabel: "6", row: 3, col: 3 },
  { id: "plus", label: "+", action: { type: "operator", operator: "+" }, variant: "secondary", ariaLabel: "Somar", row: 3, col: 4 },
  { id: "1", label: "1", action: { type: "digit", digit: "1" }, variant: "secondary", ariaLabel: "1", row: 4, col: 1 },
  { id: "2", label: "2", action: { type: "digit", digit: "2" }, variant: "secondary", ariaLabel: "2", row: 4, col: 2 },
  { id: "3", label: "3", action: { type: "digit", digit: "3" }, variant: "secondary", ariaLabel: "3", row: 4, col: 3 },
  { id: "equals", label: "=", action: { type: "equals" }, variant: "default", ariaLabel: "Calcular", row: 4, col: 4, rowSpan: 2 },
  { id: "0", label: "0", action: { type: "digit", digit: "0" }, variant: "secondary", ariaLabel: "0", row: 5, col: 1, colSpan: 2 },
  { id: "dot", label: ".", action: { type: "dot" }, variant: "secondary", ariaLabel: "Ponto decimal", row: 5, col: 3 },
]
