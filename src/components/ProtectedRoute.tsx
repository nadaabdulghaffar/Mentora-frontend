import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import authAPI from "../services/authService"

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: string[] // lowercase roles allowed, e.g. ['mentor']
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)
  const [userRole, setUserRole] = useState('')

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
          setUserRole(localUser.role?.toLowerCase() || '')
          setIsAllowed(true)
          setIsChecking(false)
        }
        return
      }

      try {
        const response = await authAPI.getMe()
        if (response.success && response.data) {
          localStorage.setItem('user', JSON.stringify(response.data))
          if (isMounted) {
            setUserRole(response.data.role?.toLowerCase() || '')
            setIsAllowed(true)
            setIsChecking(false)
          }
          return
        }
      } catch (error) {
        console.error('ProtectedRoute: failed to resolve user from API', error)
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

  if (roles && roles.length > 0) {
    if (!roles.includes(userRole)) {
      if (userRole === 'mentor') {
        return <Navigate to="/profile" replace />
      }
      if (userRole === 'mentee') {
        return <Navigate to="/profile" replace />
      }
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />
      }
      return <Navigate to="/login" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
