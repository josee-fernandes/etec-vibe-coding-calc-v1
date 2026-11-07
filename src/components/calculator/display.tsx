import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group.tsx"
import type { AngleMode } from "@/lib/calculator/types.ts"

type DisplayProps = {
  secondary: string
  primary: string
  isError: boolean
  angleMode: AngleMode
  onAngleMode: (mode: AngleMode) => void
}

export function Display({
  secondary,
  primary,
  isError,
  angleMode,
  onAngleMode,
}: DisplayProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <ToggleGroup
          type="single"
          value={angleMode}
          variant="outline"
          aria-label="Unidade do ângulo"
          onValueChange={(value) => {
            if (value === "deg" || value === "rad") onAngleMode(value)
          }}
        >
          <ToggleGroupItem value="deg" aria-label="Graus">
            DEG
          </ToggleGroupItem>
          <ToggleGroupItem value="rad" aria-label="Radianos">
            RAD
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="rounded-lg bg-muted px-4 py-3" aria-live="polite">
        <p className="truncate text-right font-mono text-sm text-muted-foreground">
          {secondary}
        </p>
        <p
          className={
            isError
              ? "mt-1 break-all text-right font-mono text-xl font-medium text-destructive"
              : "mt-1 break-all text-right font-mono text-3xl font-medium tracking-tight sm:text-4xl"
          }
        >
          {primary}
        </p>
      </div>
    </div>
  )
}
