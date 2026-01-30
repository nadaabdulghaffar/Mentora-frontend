import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import logoImage from "../../assets/images/logo.png"
import illustrationImage from "../../assets/images/rafiki.png"
import { InputField, PasswordInput, SocialLoginButton, FormDivider, AuthLink } from "../../components/Form"
import authAPI from "../../services/authService"
import { Modal } from "../../components/Modal"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [sendingEmail, setSendingEmail] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await authAPI.login(email, password)

      if (response.success && response.data) {
        if (rememberMe) {
          localStorage.setItem('email', email)
        }

        const role = response.data.user?.role?.toLowerCase()
        if (role === 'mentee') {
          navigate('/signup/mentee-form')
        } else if (role === 'mentor') {
          navigate('/signup/mentor-form')
        } else {
          navigate('/role-selection')
        }
      } else {
        setError(response.message || response.errors?.[0] || 'Sign in failed')
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Request failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const emailToSend = forgotPasswordEmail || email
    if (!emailToSend) {
      return
    }

    setSendingEmail(true)
    await authAPI.forgotPassword(emailToSend)
    setSendingEmail(false)
    setForgotPasswordEmail(emailToSend)
    setResendCooldown(60)
  }

  const handleResendResetEmail = async () => {
    if (resendCooldown > 0) return
    
    setSendingEmail(true)
    await authAPI.forgotPassword(forgotPasswordEmail)
    setSendingEmail(false)
    setResendCooldown(60)
  }

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  return (
    <div className="min-h-screen bg-white font-sans lg:grid lg:grid-cols-2">
      {/* Left Panel - Login Form */}
      <div className="flex items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-xl space-y-6">
          {/* Logo */}
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

          {/* Welcome Message */}
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-slateInk">Welcome Back!</h1>
            <p className="text-sm text-gray-600">Sign in to continue your mentorship journey</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                {error}
              </div>
            )}

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
            />

            <div className="flex items-center justify-between text-sm text-gray-600">
              <label className="flex cursor-pointer items-center gap-2 select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPasswordModal(true)
                  handleForgotPassword()
                }}
                className="font-semibold text-primary transition hover:text-primary-dark"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Sign in'}
            </button>

            <FormDivider text="Or log in with:" />

            <div className="grid grid-cols-2 gap-3">
              <SocialLoginButton provider="Google" />
              <SocialLoginButton provider="Github" />
            </div>

            <div className="h-px bg-gray-200" />

            <AuthLink 
              text="No account yet?" 
              linkText="Create an account" 
              to="/signup" 
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

      {/* Forgot Password Modal */}
      <Modal isOpen={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)}>
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-3xl">
            📧
          </div>
          <h2 className="text-2xl font-bold text-slateInk">Check Your Email</h2>
          <p className="text-gray-600">
            An email has been sent to{' '}
            <strong className="text-slateInk">{forgotPasswordEmail}</strong>{' '}
            to reset your password.
          </p>
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-600">
              Didn't receive the email?{' '}
              <button
                type="button"
                onClick={handleResendResetEmail}
                disabled={sendingEmail || resendCooldown > 0}
                className="font-semibold text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
              </button>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Login
