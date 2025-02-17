import { ReactNode } from 'react'

export const StepContainer = ({ children }: { children: ReactNode }) => (
  <div className="space-y-8">
    {children}
  </div>
)

export const StepTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="text-2xl font-bold text-gray-900 mb-6">
    {children}
  </h2>
)

export const FormGroup = ({ children }: { children: ReactNode }) => (
  <div className="space-y-6">
    {children}
  </div>
)

export const Select = ({ ...props }) => (
  <select
    {...props}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
  />
)

export const Input = ({ ...props }) => (
  <input
    {...props}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
  />
)

export const RadioGroup = ({ children }: { children: ReactNode }) => (
  <div className="space-y-2">
    {children}
  </div>
)

export const RadioLabel = ({ children }: { children: ReactNode }) => (
  <label className="flex items-center space-x-3">
    {children}
  </label>
)

export const CheckboxGroup = ({ children }: { children: ReactNode }) => (
  <div className="space-y-2">
    {children}
  </div>
)

export const CheckboxLabel = ({ children }: { children: ReactNode }) => (
  <label className="flex items-center space-x-3">
    {children}
  </label>
)

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="mt-2">
    <p className="text-sm text-red-600">{message}</p>
  </div>
)

export const ButtonGroup = ({ onNext, onPrev }: { onNext: () => void, onPrev?: () => void }) => (
  <div className="flex justify-between gap-4 pt-6">
    {onPrev && (
      <button
        type="button"
        onClick={onPrev}
        className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300"
      >
        戻る
      </button>
    )}
    <button
      type="button"
      onClick={onNext}
      className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark"
    >
      次へ進む
    </button>
  </div>
) 