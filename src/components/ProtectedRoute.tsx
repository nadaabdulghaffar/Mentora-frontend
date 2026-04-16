import { Navigate } from "react-router-dom"
import authAPI from "../services/authService"

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: string[] // lowercase roles allowed, e.g. ['mentor']
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const isAuthenticated = authAPI.isAuthenticated()
  const user = authAPI.getCurrentUser()

  console.log('ProtectedRoute check:', { isAuthenticated, roles, hasAccessToken: !!localStorage.getItem('accessToken'), hasUser: !!user });

  if (!isAuthenticated || !user) {
    console.warn('User not authenticated or missing local user, redirecting to login');
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0) {
    const userRole = user.role?.toLowerCase() || ''
    
    console.log('Role check:', { userRole, allowedRoles: roles, hasUser: !!user });
    
    if (!roles.includes(userRole)) {
      // if user exists, try redirecting to an appropriate home
      if (userRole === 'mentor') {
        console.log('User is mentor, redirecting to mentor dashboard');
        return <Navigate to="/mentor/dashboard" replace />
      }
      if (userRole === 'mentee') {
        console.log('User is mentee, redirecting to mentee dashboard');
        return <Navigate to="/dashboard" replace />
      }
      // otherwise send to login
      console.log('Role not allowed, redirecting to login');
      return <Navigate to="/login" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
