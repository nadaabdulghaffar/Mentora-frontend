import { useState } from "react"
import { useNavigate } from "react-router-dom"
import bgImage from "../../assets/images/bg.png"
import menteeIcon from "../../assets/images/menteeIcon.png"
import mentorIcon from "../../assets/images/mentorIcon.png"
import authAPI from "../../services/authService"

function RoleSelection() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<'mentee' | 'mentor' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleContinue = async () => {
    if (!selectedRole) return

    setLoading(true)
    setError("")

    const registrationToken = localStorage.getItem('registrationToken')
    if (!registrationToken) {
      setError('Missing registration token. Please sign up again.')
      setLoading(false)
      navigate('/signup')
      return
    }

    try {
      const response = await authAPI.selectRole(selectedRole, registrationToken)

      if (response.success) {
        if (selectedRole === 'mentee') {
          navigate('/signup/mentee-form')
        } else {
          navigate('/signup/mentor-form')
        }
      } else {
        setError(response.message || response.errors?.[0] || 'Failed to save role')
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Request failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat px-4 py-10 font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="mx-auto w-full max-w-3xl space-y-8 rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slateInk">Welcome to Mentora!</h1>
          <p className="text-base text-gray-600">Are you here to guide others or seeking guidance?</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div
            className={`flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 p-6 text-center transition hover:-translate-y-0.5 hover:border-primary hover:bg-indigo-50 hover:shadow-lg ${selectedRole === 'mentee' ? 'border-primary bg-indigo-50 shadow-lg' : 'border-gray-200 bg-gray-50'}`}
            onClick={() => setSelectedRole('mentee')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedRole('mentee')
              }
            }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <img src={menteeIcon} alt="Mentee" className="h-18 w-18 object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-slateInk">Mentee</h3>
            <p className="text-sm text-gray-600">Learn from experts and grow your career</p>
          </div>

          <div
            className={`flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 p-6 text-center transition hover:-translate-y-0.5 hover:border-primary hover:bg-indigo-50 hover:shadow-lg ${selectedRole === 'mentor' ? 'border-primary bg-indigo-50 shadow-lg' : 'border-gray-200 bg-gray-50'}`}
            onClick={() => setSelectedRole('mentor')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedRole('mentor')
              }
            }}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <img src={mentorIcon} alt="Mentor" className="h-18 w-18 object-contain" />
            </div>
            <h3 className="text-xl font-semibold text-slateInk">Mentor</h3>
            <p className="text-sm text-gray-600">Share your experience and guide others</p>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          className="w-full rounded-xl bg-[#332D54] py-3 text-base font-semibold text-white shadow-md transition hover:bg-[#2b2648] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#332D54]"
          onClick={handleContinue}
          disabled={!selectedRole || loading}
        >
          {loading ? 'Loading...' : 'Continue'}
        </button>

        <div className="text-center text-gray-600">
          <span>Already have an account? </span>
          <button
            className="font-semibold text-primary transition hover:text-primary-dark"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
