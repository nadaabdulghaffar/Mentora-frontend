import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import authAPI from "../../services/authService"
import bgImage from "../../assets/images/bg.png"
import emailImage from "../../assets/images/email.png"

function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [hasToken, setHasToken] = useState(false)
  const [verifyAttempted, setVerifyAttempted] = useState(false)

  useEffect(() => {
    // Check if token is in URL (from email link)
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')
    const storedEmail = localStorage.getItem('pendingUserEmail')
    const resolvedEmail = emailParam || storedEmail

    // Set email from URL or localStorage
    if (resolvedEmail) {
      setEmail(resolvedEmail)
      if (emailParam) {
        localStorage.setItem('pendingUserEmail', emailParam)
      }
    } else {
      navigate('/signup')
      return
    }

    // If token is in URL, auto-verify immediately
    if (tokenParam && !verifyAttempted) {
      setHasToken(true)
      setVerifyAttempted(true)
      verifyWithToken(tokenParam, resolvedEmail)
    }
  }, [searchParams, navigate, verifyAttempted])

  const verifyWithToken = async (token: string, userEmail: string) => {
    setLoading(true)
    setError("")

    const response = await authAPI.verifyEmail(token, userEmail)

    if (response.success) {
      const registrationToken = response.data?.registrationToken
      if (registrationToken) {
        localStorage.setItem('registrationToken', registrationToken)
      }
      setSuccess(true)
      localStorage.removeItem('pendingUserEmail')
      setTimeout(() => navigate('/role-selection'), 2000)
    } else {
      setError(response.message || response.errors?.[0] || 'Email verification failed')
      setLoading(false)
    }
  }

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerify = async () => {
    setLoading(true)
    setError("")

    const code = (document.getElementById('verification-code') as HTMLInputElement)?.value

    if (!code) {
      setError('Please enter the verification code')
      setLoading(false)
      return
    }

    const response = await authAPI.verifyEmail(code, email)

    if (response.success) {
      const registrationToken = response.data?.registrationToken
      if (registrationToken) {
        localStorage.setItem('registrationToken', registrationToken)
      }
      setSuccess(true)
      localStorage.removeItem('pendingUserEmail')
      setTimeout(() => navigate('/role-selection'), 2000)
    } else {
      setError(response.message || response.errors?.[0] || 'Email verification failed')
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError("")

    const response = await authAPI.resendVerificationCode(email)

    if (response.success) {
      setResendCooldown(60)
    } else {
      setError(response.message || response.errors?.[0] || 'Failed to resend the code')
    }

    setResendLoading(false)
  }

  const handleChangeEmail = () => {
    localStorage.removeItem('pendingUserEmail')
    navigate('/signup')
  }

  // Success screen
  if (success) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10 font-sans"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">✓</div>
          <h1 className="text-2xl font-bold text-slateInk">Email Verified!</h1>
          <p className="text-sm text-gray-600">Your email has been verified. Redirecting to role selection...</p>
        </div>
      </div>
    )
  }

  // Loading screen when verifying from email link
  if (loading && hasToken) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10 font-sans"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
          </div>
          <h1 className="text-2xl font-bold text-slateInk">Verifying Email...</h1>
          <p className="text-sm text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    )
  }

  // Main verification form
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10 font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm">
        <div className="mb-4 flex justify-center">
          <img src={emailImage} alt="Email" className="h-20 w-20 object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-slateInk">Check your email</h1>

        <p className="mt-4 text-base leading-relaxed text-gray-700">
          We've sent a verification link to <strong className="font-semibold text-slateInk">{email}</strong>
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-3 px-4 py-3 text-sm text-gray-600">
          <p>
            Didn't receive the email?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading || resendCooldown > 0}
              className="font-semibold text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendCooldown > 0 ? `Try again in ${resendCooldown}s` : 'Resend Email'}
            </button>
          </p>

          <p>
            Wrong email?{' '}
            <button
              type="button"
              onClick={handleChangeEmail}
              className="font-semibold text-primary transition hover:text-primary-dark"
            >
              change email address
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
