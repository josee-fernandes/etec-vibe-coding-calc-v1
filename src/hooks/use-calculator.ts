import { useMemo, useReducer } from "react"
import { formatExpression } from "@/lib/calculator/format.ts"
import {
  calculatorReducer,
  initialCalculatorState,
} from "@/lib/calculator/state.ts"

export function useCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState)

  const secondary = useMemo(() => {
    const source = state.committed ? state.formula : state.expression
    return formatExpression(source) || "0"
  }, [state.committed, state.expression, state.formula])

  const primary = state.error ?? state.preview ?? "0"

  return {
    ...state,
    secondary,
    primary,
    dispatch,
  }
}
