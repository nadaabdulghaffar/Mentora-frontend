import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import authAPI from "../../services/authService"

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    let isMounted = true

    const verifyAccess = async () => {
      const hasToken = authAPI.isAuthenticated()
      if (!hasToken) {
        if (isMounted) {
          setIsAllowed(false)
          setIsChecking(false)
        }
        return
      }

      const localUser = authAPI.getCurrentUser()
      if (localUser) {
        if (isMounted) {
          setIsAllowed(localUser.role?.toLowerCase() === 'admin')
          setIsChecking(false)
        }
        return
      }

      try {
        const response = await authAPI.getMe()
        if (response.success && response.data) {
          localStorage.setItem('user', JSON.stringify(response.data))
          if (isMounted) {
            setIsAllowed(response.data.role?.toLowerCase() === 'admin')
            setIsChecking(false)
          }
          return
        }
      } catch (error) {
        console.error('AdminProtectedRoute: failed to resolve user from API', error)
      }

      if (isMounted) {
        setIsAllowed(false)
        setIsChecking(false)
      }
    }

    verifyAccess()

    return () => {
      isMounted = false
    }
  }, [])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA]">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAllowed) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default AdminProtectedRoute
