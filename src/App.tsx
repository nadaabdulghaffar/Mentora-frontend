import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/auth/login"
import Signup from "./pages/auth/signup"
import VerifyEmail from "./pages/auth/verify-email"
import RoleSelection from "./pages/auth/role-selection"
import MenteeForm from "./pages/auth/mentee-form"
import MentorForm from "./pages/auth/mentor-form"
import ResetPassword from "./pages/auth/reset-password"
import AuthSuccess from "./pages/auth/auth-success"

function App() { 
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/role-selection" element={<RoleSelection />} />
      <Route path="/signup/mentee-form" element={<MenteeForm />} />
      <Route path="/signup/mentor-form" element={<MentorForm />} />
    </Routes>
  )
}

export default App
