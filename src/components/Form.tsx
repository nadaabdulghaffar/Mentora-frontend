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
  required?: boolean
}

export function InputField({ 
  id, 
  label, 
  type, 
  placeholder, 
  value, 
  onChange, 
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
  required?: boolean
  requirementText?: string
}

export function PasswordInput({ 
  id, 
  label, 
  placeholder, 
  value, 
  onChange, 
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
          className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 text-base text-slateInk placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
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
  provider: "Google" | "Apple"
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

  const appleIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  )

  return (
    <button 
      type="button" 
      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slateInk transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={onClick}
    >
      {provider === "Google" ? googleIcon : appleIcon}
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
