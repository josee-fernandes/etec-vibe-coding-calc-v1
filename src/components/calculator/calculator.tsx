import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card.tsx"
import { useCalculator } from "@/hooks/use-calculator.ts"
import type { CalculatorAction } from "@/lib/calculator/state.ts"
import { Display } from "./display.tsx"
import { Keypad } from "./keypad.tsx"

function actionFromKey(key: string): CalculatorAction | null {
  if (key >= "0" && key <= "9") return { type: "digit", digit: key }
  if (key === "." || key === ",") return { type: "dot" }
  if (key === "+") return { type: "operator", operator: "+" }
  if (key === "-") return { type: "operator", operator: "-" }
  if (key === "*") return { type: "operator", operator: "*" }
  if (key === "/") return { type: "operator", operator: "/" }
  if (key === "^") return { type: "operator", operator: "^" }
  if (key === "%") return { type: "percent" }
  if (key === "(") return { type: "paren", side: "open" }
  if (key === ")") return { type: "paren", side: "close" }
  if (key === "Enter" || key === "=") return { type: "equals" }
  if (key === "Backspace") return { type: "backspace" }
  if (key === "Escape") return { type: "clear" }
  return null
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable
}

export function Calculator() {
  const calculator = useCalculator()
  const { dispatch } = calculator

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("button") &&
        (event.key === "Enter" || event.key === " ")
      ) {
        return
      }

      const action = actionFromKey(event.key)
      if (!action) return
      event.preventDefault()
      dispatch(action)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dispatch])

  return (
    <Card className="w-full" size="sm">
      <CardContent className="flex flex-col gap-3">
        <Display
          secondary={calculator.secondary}
          primary={calculator.primary}
          isError={calculator.error !== null}
          angleMode={calculator.angleMode}
          onAngleMode={(mode) => dispatch({ type: "mode", mode })}
        />
        <Keypad onAction={dispatch} />
      </CardContent>
    </Card>
  )
}
