import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { authAPI } from "../../services/auth"
import bgImage from "../../assets/images/bg.png"
import { PasswordInput } from "../../components/Form"
import { Alert } from "../../components/Alert"

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      navigate('/login')
      return
    }
    setToken(tokenParam)
  }, [searchParams, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    const response = await authAPI.resetPassword(token, newPassword)

    if (response.success) {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setError(response.message || response.errors?.[0] || 'Failed to reset password')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10 font-sans"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white/90 p-8 text-center shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">✓</div>
          <h1 className="text-2xl font-bold text-slateInk">Password Changed Successfully!</h1>
          <p className="text-sm text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10 font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slateInk">Set New Password</h1>
          <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <PasswordInput
            id="new-password"
            label="New Password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            requirementText="Must contain: uppercase, lowercase, numbers and special characters (min 8 characters)"
          />

          <PasswordInput
            id="confirm-password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#332D54] py-3 text-base font-semibold text-white shadow-md transition transform hover:-translate-y-0.5 hover:bg-[#2b2648] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm text-primary transition hover:text-primary-dark"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
