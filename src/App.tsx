import { Calculator } from "@/components/calculator/calculator.tsx"

function App() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <h1 className="mb-3 text-center text-xl font-semibold tracking-tight sm:text-2xl">
          Calculadora científica
        </h1>
        <Calculator />
      </div>
    </main>
  )
}

export default App
