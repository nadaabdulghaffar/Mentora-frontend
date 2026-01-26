import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
//import { apiCall } from "../../services/auth"
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

  useEffect(() => {
    // Get email from query params or localStorage
    const emailParam = searchParams.get('email')
    const storedEmail = localStorage.getItem('pendingEmail')
    
    if (emailParam) {
      setEmail(emailParam)
      localStorage.setItem('pendingEmail', emailParam)
    } else if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // If no email found, redirect to signup
      navigate('/signup')
    }
  }, [searchParams, navigate])

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

    if (!code || code.length < 6) {
      setError('Please enter the complete verification code')
      setLoading(false)
      return
    }

    // TODO: Remove this mock and uncomment API call when backend is ready
    // For now, simulating successful verification
    setTimeout(() => {
      setSuccess(true)
      localStorage.removeItem('pendingEmail')
      // Redirect to role-selection after 2 seconds
      setTimeout(() => navigate('/role-selection'), 2000)
    }, 500)

    // Uncomment this when backend is ready:
    // const response = await apiCall('/auth/verify-email', {
    //   method: 'POST',
    //   body: JSON.stringify({ email, code }),
    // })
    // if (response.success) {
    //   setSuccess(true)
    //   localStorage.removeItem('pendingEmail')
    //   setTimeout(() => navigate('/role-selection'), 2000)
    // } else {
    //   setError(response.error || 'Email verification failed')
    //   setLoading(false)
    // }
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    setError("")

    // TODO: Remove this mock and uncomment API call when backend is ready
    setTimeout(() => {
      setResendCooldown(60)
    }, 300)

    // Uncomment this when backend is ready:
    // const response = await apiCall('/auth/resend-verification-code', {
    //   method: 'POST',
    //   body: JSON.stringify({ email }),
    // })
    // if (response.success) {
    //   setResendCooldown(60)
    // } else {
    //   setError(response.error || 'Failed to resend the code')
    // }
    // setResendLoading(false)
  }

  const handleChangeEmail = () => {
    localStorage.removeItem('pendingEmail')
    navigate('/signup')
  }

  if (success) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10 font-sans"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">✓</div>
          <h1 className="text-2xl font-bold text-slateInk">Email Verified!</h1>
          <p className="text-sm text-gray-600">Your email has been verified. Redirecting to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10 font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm">
        <div className="mb-4 flex justify-center">
          <img src={emailImage} alt="Email" className="h-20 w-20 object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-slateInk">Verify your email</h1>

        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          We've sent a verification code to <strong className="font-semibold text-slateInk">{email}</strong> for verification to keep a trusted and safe community, and you'll only do this once.
        </p>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <input
            type="text"
            id="verification-code"
            placeholder="Enter verification code"
            maxLength={6}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-[14px] font-regular tracking-[0.1rem] text-slateInk placeholder:text-[16px] placeholder:text-gray-300 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleVerify()
            }}
          />

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="w-full rounded-xl bg-[#332D54] py-3 text-base font-semibold text-white shadow-md transition transform hover:-translate-y-0.5 hover:bg-[#2b2648] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#332D54]"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        <div className="mt-8 space-y-3  px-4 py-3 text-sm text-gray-600">
           <p>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading || resendCooldown > 0}
              className="font-semibold text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resendCooldown > 0 ? `Try again in ${resendCooldown}s` : 'Resend'}
            </button>
          </p>
          
          
          <p>
            Not the correct email?{' '}
            <button
              type="button"
              onClick={handleChangeEmail}
              className="font-semibold text-primary transition hover:text-primary-dark"
            >
              change email address
            </button>
          </p>

         
        </div>

        {/* 
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-semibold text-primary transition hover:text-primary-dark"
          >
            Sign in
          </button>
        </p>
        */}
      </div>
    </div>
  )
}

export default VerifyEmail
