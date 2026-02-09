import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import authAPI from "../../services/authService"

function AuthSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get("token")
    const refreshToken = searchParams.get("refreshToken")

    if (!token || !refreshToken) {
      navigate("/login")
      return
    }

    localStorage.setItem("accessToken", token)
    localStorage.setItem("refreshToken", refreshToken)

    const loadUser = async () => {
      try {
        const response = await authAPI.getMe()
        if (response.success && response.data) {
          localStorage.setItem("user", JSON.stringify(response.data))
          const role = response.data.role?.toLowerCase()
          if (role === "mentee") {
            navigate("/signup/mentee-form")
            return
          }
          if (role === "mentor") {
            navigate("/signup/mentor-form")
            return
          }
        }
        navigate("/role-selection")
      } catch {
        navigate("/role-selection")
      }
    }

    loadUser()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-white font-sans flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
        <p className="text-sm text-gray-600">Signing you in...</p>
      </div>
    </div>
  )
}

export default AuthSuccess
