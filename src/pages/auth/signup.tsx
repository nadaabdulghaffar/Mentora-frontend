import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logoImage from "../../assets/images/logo.png"
import illustrationImage from "../../assets/images/rafiki.png"
import { InputField, PasswordInput, SocialLoginButton, FormDivider, AuthLink } from "../../components/Form"
//import { authAPI } from "../../services/auth"


function Signup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // TODO: Remove this mock and uncomment API call when backend is ready
    // For now, simulating successful signup
    setTimeout(() => {
      // Save email for verification page
      localStorage.setItem('pendingEmail', email)
      // Redirect to verify email page
      navigate(`/verify-email?email=${encodeURIComponent(email)}`)
    }, 500)

    // Uncomment this when backend is ready:
    // const response = await authAPI.signup(email, password, fullName)
    // if (response.success) {
    //   localStorage.setItem('pendingEmail', email)
    //   navigate(`/verify-email?email=${encodeURIComponent(email)}`)
    // } else {
    //   setError(response.error || 'Failed to create account')
    //   setLoading(false)
    // }
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
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                id="firstName"
                label="First name"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <InputField
                id="lastName"
                label="Last name"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <InputField
              id="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordInput
              id="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              requirementText="It must be a combination of minimum 8 letters, numbers, and symbols."
            />

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
              <SocialLoginButton provider="Apple" />
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
