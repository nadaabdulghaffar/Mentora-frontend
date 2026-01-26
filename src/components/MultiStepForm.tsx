import React from "react"

// Generic types
export type Option = { label: string; value: string }

// Layout wrappers
export function FormContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] px-4 py-10 flex items-center justify-center">
      {children}
    </div>
  )
}

export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-3xl rounded-2xl bg-white p-8 sm:p-10 shadow-2xl">
      {children}
    </div>
  )
}

// Progress
export function StepProgress({ current, total }: { current: number; total: number }) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(total, 1)) * 100))
  return (
    <div className="mb-10">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-center text-sm text-gray-500">Step {current} of {total}</p>
    </div>
  )
}

// Typography
export const StepTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="mb-2 text-center text-xl font-bold text-slateInk sm:text-[1.5rem]">{children}</h2>
)

export const StepSubtitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-8 text-center text-base text-gray-600 sm:text-lg">{children}</p>
)

// Field group
export const InputGroup: React.FC<{ label: string; htmlFor?: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
  <div className="mb-6 flex flex-col gap-2 last:mb-0">
    <label htmlFor={htmlFor} className="text-sm font-semibold text-slateInk">{label}</label>
    {children}
  </div>
)

// Controls
export const SelectField: React.FC<{
  id: string
  value: string
  onChange: (v: string) => void
  options: Option[]
}> = ({ id, value, onChange, options }) => (
  <select
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-slateInk outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
  >
    <option value="">Select an option</option>
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
)

export const TextAreaField: React.FC<{
  id: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}> = ({ id, value, onChange, rows = 5, placeholder }) => (
  <textarea
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-slateInk outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
    rows={rows}
    placeholder={placeholder}
  />
)

// Choice lists
export const CheckboxList: React.FC<{
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
}> = ({ items, selected, onToggle }) => (
  <div className="space-y-3">
    {items.map((item) => (
      <label
        key={item}
        className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-primary hover:bg-indigo-50"
      >
        <input
          type="checkbox"
          className="h-4 w-4 cursor-pointer text-primary focus:ring-primary"
          checked={selected.includes(item)}
          onChange={() => onToggle(item)}
        />
        <span className="text-sm text-slateInk">{item}</span>
      </label>
    ))}
  </div>
)

export const RadioList: React.FC<{
  name: string
  items: string[]
  value: string
  onChange: (v: string) => void
}> = ({ name, items, value, onChange }) => (
  <div className="space-y-3">
    {items.map((item) => (
      <label
        key={item}
        className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-primary hover:bg-indigo-50"
      >
        <input
          type="radio"
          name={name}
          value={item}
          className="h-4 w-4 cursor-pointer text-primary focus:ring-primary"
          checked={value === item}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="text-sm text-slateInk">{item}</span>
      </label>
    ))}
  </div>
)

// Select with Tags
export const SelectWithTags: React.FC<{
  id: string
  options: string[]
  selected: string[]
  onAdd: (item: string) => void
  onRemove: (item: string) => void
  placeholder?: string
}> = ({ id, options, selected, onAdd, onRemove, placeholder = "Select an option" }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const availableOptions = options.filter(opt => !selected.includes(opt))

  return (
    <div className="space-y-3">
      {/* Dropdown with Tags Inside */}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-[48px] rounded-xl border border-gray-200 bg-white px-4 py-2 text-base text-slateInk outline-none transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 flex items-center gap-2 flex-wrap cursor-pointer"
        >
          {/* Tags Display Inside */}
          {selected.length > 0 ? (
            selected.map((tag) => (
              <div
                key={tag}
                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(tag)
                  }}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-primary hover:bg-primary/20 transition"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
          
          {/* Arrow Icon */}
          <svg 
            className={`ml-auto h-4 w-4 text-slateInk transition flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Dropdown Menu */}
        {isOpen && availableOptions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg z-10 max-h-60 overflow-y-auto">
            {availableOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onAdd(option)
                  if (availableOptions.length === 1) setIsOpen(false)
                }}
                className="block w-full px-4 py-3 text-left text-sm text-slateInk hover:bg-indigo-50 first:rounded-t-xl last:rounded-b-xl transition"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Navigation buttons
export const FormNavigation: React.FC<{
  canBack: boolean
  onBack: () => void
  isLast: boolean
  onNext: () => void
  onSubmit: () => void
  submitting?: boolean
}> = ({ canBack, onBack, isLast, onNext, onSubmit, submitting }) => (
  <div className="mt-10 flex flex-col gap-3 sm:flex-row">
    <button
      className="flex-1 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-base font-semibold text-slateInk transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onBack}
      disabled={!canBack}
    >
      Back
    </button>
    {isLast ? (
      <button
        className="flex-1 rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onSubmit}
        disabled={!!submitting}
      >
        {submitting ? 'Submitting...' : 'Complete Setup'}
      </button>
    ) : (
      <button
        className="flex-1 rounded-xl bg-primary px-4 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onNext}
      >
        Next
      </button>
    )}
  </div>
)
