import { Delete } from "lucide-react"
import { Button } from "@/components/ui/button.tsx"
import type { CalculatorAction } from "@/lib/calculator/state.ts"
import { numericKeys, scientificKeys, type KeyDefinition } from "./keys.ts"

type KeypadProps = {
  onAction: (action: CalculatorAction) => void
}

function KeyButton({
  definition,
  onAction,
}: {
  definition: KeyDefinition
  onAction: (action: CalculatorAction) => void
}) {
  const placement =
    definition.row && definition.col
      ? {
          gridRow: definition.rowSpan
            ? `${definition.row} / span ${definition.rowSpan}`
            : String(definition.row),
          gridColumn: definition.colSpan
            ? `${definition.col} / span ${definition.colSpan}`
            : String(definition.col),
        }
      : undefined

  return (
    <Button
      type="button"
      variant={definition.variant}
      aria-label={definition.ariaLabel}
      style={placement}
      className={
        definition.rowSpan === 2
          ? "h-auto min-h-10 px-1 text-sm md:min-h-12 md:px-2 md:text-base"
          : "h-10 px-1 text-sm md:h-12 md:px-2 md:text-base"
      }
      onClick={() => onAction(definition.action)}
    >
      {definition.id === "backspace" ? <Delete aria-hidden="true" /> : definition.label}
    </Button>
  )
}

export function Keypad({ onAction }: KeypadProps) {
  return (
    <div className="grid gap-2 md:grid-cols-2 md:gap-3">
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {scientificKeys.map((definition) => (
          <KeyButton key={definition.id} definition={definition} onAction={onAction} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {numericKeys.map((definition) => (
          <KeyButton key={definition.id} definition={definition} onAction={onAction} />
        ))}
      </div>
    </div>
  )
}
