import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logoImage from "../../assets/images/logo.png"
import illustrationImage from "../../assets/images/rafiki.png"
import { InputField, PasswordInput, SocialLoginButton, FormDivider, AuthLink } from "../../components/Form"
import { Alert } from "../../components/Alert"
import { authAPI } from "../../services/auth"
import { 
  validateSignupForm, 
  validatePassword, 
  validateFirstName, 
  validateLastName, 
  validateEmail 
} from "../../utils/validation"


function Signup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    
    // Check password strength in real-time
    if (newPassword) {
      const validation = validatePassword(newPassword)
      setPasswordStrength(validation.strength || '')
      
      // Update error if field was touched
      if (touched.password) {
        setFieldErrors(prev => ({
          ...prev,
          password: validation.valid ? '' : (validation.message || '')
        }))
      }
    } else {
      setPasswordStrength('')
      if (touched.password) {
        setFieldErrors(prev => ({ ...prev, password: 'Password is required' }))
      }
    }
  }

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    let validation
    switch (field) {
      case 'firstName':
        validation = validateFirstName(value)
        break
      case 'lastName':
        validation = validateLastName(value)
        break
      case 'email':
        validation = validateEmail(value)
        break
      case 'password':
        validation = validatePassword(value)
        break
      default:
        return
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.valid ? '' : (validation.message || '')
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    // Validate form before submission
    const validation = validateSignupForm(firstName, lastName, email, password)
    
    if (!validation.valid) {
      const errors: Record<string, string> = {}
      validation.errors.forEach(err => {
        errors[err.field] = err.message
      })
      setFieldErrors(errors)
      setError(validation.errors[0]?.message || 'Please check the entered data')
      return
    }

    setLoading(true)

    const response = await authAPI.registerInitial(firstName, lastName, email, password)

    if (response.success) {
      const userId = response.data?.userId
      localStorage.setItem('pendingUserEmail', email)
      if (userId) {
        localStorage.setItem('pendingUserId', userId)
      }
      navigate(`/verify-email?email=${encodeURIComponent(email)}`)
    } else {
      setError(response.message || response.errors?.[0] || 'Failed to create account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans lg:grid lg:grid-cols-2">
      {/* Left Panel - Signup Form */}
      <div className="flex items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-xl space-y-6">
          <div className="mb-2 flex justify-center">
            <div className="relative flex h-20 w-44 items-center justify-center">
              <img 
                src={logoImage} 
                alt="Mentora Logo" 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  const fallback = target.parentElement?.querySelector('.logo-fallback') as HTMLElement | null
                  if (fallback) {
                    fallback.classList.remove('hidden')
                  }
                }}
              />
              <div className="logo-fallback hidden items-center gap-1 text-xl font-bold">
                <span className="text-primary">M</span>
                <span className="text-primary-dark -rotate-45">↑</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slateInk">Create your account</h1>
            <p className="text-sm text-gray-600">Join Mentora where mentorship meets growth</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert 
                type="error" 
                message={error}
                dismissible
              />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <InputField
                  id="firstName"
                  label="First name"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value)
                    if (touched.firstName && fieldErrors.firstName) {
                      const validation = validateFirstName(e.target.value)
                      setFieldErrors(prev => ({
                        ...prev,
                        firstName: validation.valid ? '' : (validation.message || '')
                      }))
                    }
                  }}
                  onBlur={() => handleBlur('firstName', firstName)}
                  required
                />
                {fieldErrors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <InputField
                  id="lastName"
                  label="Last name"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value)
                    if (touched.lastName && fieldErrors.lastName) {
                      const validation = validateLastName(e.target.value)
                      setFieldErrors(prev => ({
                        ...prev,
                        lastName: validation.valid ? '' : (validation.message || '')
                      }))
                    }
                  }}
                  onBlur={() => handleBlur('lastName', lastName)}
                  required
                />
                {fieldErrors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <InputField
                id="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (touched.email && fieldErrors.email) {
                    const validation = validateEmail(e.target.value)
                    setFieldErrors(prev => ({
                      ...prev,
                      email: validation.valid ? '' : (validation.message || '')
                    }))
                  }
                }}
                onBlur={() => handleBlur('email', email)}
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <PasswordInput
                id="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur('password', password)}
                required
                requirementText="Must contain: uppercase, lowercase, numbers and special characters (min 8 characters)"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
              )}
              {password && passwordStrength && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : 'bg-red-300'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  </div>
                  <p className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-red-600' : 
                    passwordStrength === 'medium' ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {passwordStrength === 'weak' ? 'Weak password' : 
                     passwordStrength === 'medium' ? 'Medium password' : 
                     'Strong password'}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Continue'}
            </button>

            <FormDivider text="Or sign up with:" />

            <div className="grid grid-cols-2 gap-3">
              <SocialLoginButton provider="Google" />
              <SocialLoginButton provider="Github" />
            </div>

            <AuthLink 
              text="Already have an account?" 
              linkText="Log in" 
              to="/login" 
            />
          </form>
        </div>
      </div>

      {/* Right Panel - Illustration and Slogan */}
      <div className="hidden min-h-screen items-center justify-center bg-primary px-10 py-12 text-white lg:flex">
        <div className="max-w-md text-center">
          <h2 className="mb-8 text-3xl font-bold leading-tight">Connect. Learn. Grow.</h2>
          <div className="relative h-[320px] w-full">
            <img 
              src={illustrationImage} 
              alt="Mentorship Illustration" 
              className="h-full w-full object-contain"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const fallback = target.parentElement?.querySelector('.illustration-fallback') as HTMLElement | null
                if (fallback) {
                  fallback.classList.remove('hidden')
                }
              }}
            />
            <div className="illustration-fallback hidden absolute inset-0 flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-lg font-semibold backdrop-blur">
              Mentora
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
