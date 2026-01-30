import { useState } from "react"
import { Link } from "react-router-dom"

// InputField Component
interface InputFieldProps {
  id: string
  label: string
  type: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  required?: boolean
}

export function InputField({ 
  id, 
  label, 
  type, 
  placeholder, 
  value, 
  onChange,
  onBlur,
  required = false
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-slateInk">{label}</label>
      <input
        id={id}
        type={type}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-slateInk placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
      />
    </div>
  )
}

// PasswordInput Component
interface PasswordInputProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  required?: boolean
  requirementText?: string
}

export function PasswordInput({ 
  id, 
  label, 
  placeholder, 
  value, 
  onChange,
  onBlur,
  required = false,
  requirementText
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-slateInk">{label}</label>
      <div className="relative flex items-center">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-base text-slateInk placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete="off"
          data-form-type="password"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-primary"
          onClick={() => setShowPassword(!showPassword)}
          aria-label="Toggle password visibility"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {showPassword ? (
              <path
                d="M2.5 2.5L17.5 17.5M8.25 8.25C7.8375 8.6625 7.5 9.25 7.5 10C7.5 11.375 8.625 12.5 10 12.5C10.75 12.5 11.3375 12.1625 11.75 11.75M8.25 8.25L11.75 11.75M8.25 8.25L5.5 5.5M11.75 11.75L14.5 14.5M5.5 5.5C3.75 6.75 2.5 8.375 2.5 10C2.5 13.75 6.25 16.25 10 16.25C11.625 16.25 13.125 15.75 14.5 14.5M5.5 5.5L2.5 2.5M14.5 14.5L17.5 17.5M14.5 14.5C16.25 13.25 17.5 11.625 17.5 10C17.5 6.25 13.75 3.75 10 3.75C8.375 3.75 6.875 4.25 5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <>
                <path
                  d="M10 3.75C6.25 3.75 2.5 6.25 2.5 10C2.5 13.75 6.25 16.25 10 16.25C13.75 16.25 17.5 13.75 17.5 10C17.5 6.25 13.75 3.75 10 3.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 12.5C11.375 12.5 12.5 11.375 12.5 10C12.5 8.625 11.375 7.5 10 7.5C8.625 7.5 7.5 8.625 7.5 10C7.5 11.375 8.625 12.5 10 12.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
        </button>
      </div>
      {requirementText && (
        <p className="text-xs text-gray-500">{requirementText}</p>
      )}
    </div>
  )
}

// SocialLoginButton Component
interface SocialLoginButtonProps {
  provider: "Google" | "Github"
  onClick?: () => void
}

export function SocialLoginButton({ provider, onClick }: SocialLoginButtonProps) {
  const googleIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M19.6 10.2273C19.6 9.51818 19.5364 8.83636 19.4182 8.18182H10V12.05H15.3818C15.15 13.3 14.4455 14.3591 13.3864 15.0682V17.5773H16.6182C18.5091 15.8364 19.6 13.2727 19.6 10.2273Z"
        fill="#4285F4"
      />
      <path
        d="M10 20C12.7 20 14.9636 19.1045 16.6182 17.5773L13.3864 15.0682C12.4909 15.6682 11.3455 16.0227 10 16.0227C7.39545 16.0227 5.19091 14.2636 4.40455 11.9H1.06364V14.4909C2.70909 17.7591 6.09091 20 10 20Z"
        fill="#34A853"
      />
      <path
        d="M4.40455 11.9C4.20455 11.3 4.09091 10.6591 4.09091 10C4.09091 9.34091 4.20455 8.7 4.40455 8.1V5.50909H1.06364C0.386364 6.85909 0 8.38636 0 10C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.9Z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.6955 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z"
        fill="#EA4335"
      />
    </svg>
  )

  const githubIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )

  return (
    <button 
      type="button" 
      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slateInk transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={onClick}
    >
      {provider === "Google" ? googleIcon : githubIcon}
      <span>{provider}</span>
    </button>
  )
}

// FormDivider Component
interface FormDividerProps {
  text: string
}

export function FormDivider({ text }: FormDividerProps) {
  return (
    <div className="flex w-full items-center gap-2 text-sm text-gray-500 before:h-px before:flex-1 before:bg-gray-200 before:content-[''] after:h-px after:flex-1 after:bg-gray-200 after:content-['']">
      <span>{text}</span>
    </div>
  )
}

// AuthLink Component
interface AuthLinkProps {
  text: string
  linkText: string
  to: string
}

export function AuthLink({ text, linkText, to }: AuthLinkProps) {
  return (
    <div className="text-center text-sm text-gray-600">
      <span>{text} </span>
      <Link to={to} className="font-semibold text-primary transition hover:text-primary-dark">{linkText}</Link>
    </div>
  )
}
