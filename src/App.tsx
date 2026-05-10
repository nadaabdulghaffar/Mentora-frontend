import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/auth/login"
import Signup from "./pages/auth/signup"
import VerifyEmail from "./pages/auth/verify-email"
import RoleSelection from "./pages/auth/role-selection"
import MenteeForm from "./pages/auth/mentee-form"
import MentorForm from "./pages/auth/mentor-form"
import ResetPassword from "./pages/auth/reset-password"
import AuthSuccess from "./pages/auth/auth-success"
import DashboardPage from "./pages/DashboardPage"
import MentorDashboardPage from "./pages/MentorDashboardPage"
import ExplorePage from "./pages/ExplorePage";
import MessagesPage from "./pages/MessagesPage";
import CreateMentorshipPage from "./pages/CreateMentorshipPage";
import MyProgramsPage from "./pages/MyProgramsPage";
import authAPI from './services/authService';
import MentorClassroomPage from './pages/classroom/MentorClassroomPage';
import MenteeClassroomPage from './pages/classroom/MenteeClassroomPage';
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingRoute from "./components/OnboardingRoute"; 


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
      <Route 
  path="/signup/mentee-form" 
  element={
    <OnboardingRoute>
      <MenteeForm />
    </OnboardingRoute>
  } 
/>

<Route 
  path="/signup/mentor-form" 
  element={
    <OnboardingRoute>
      <MentorForm />
    </OnboardingRoute>
  } 
/>
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute roles={[ 'mentee' ]}>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute roles={[ 'mentor' ]}>
            <MentorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search-mentorship"
        element={
          <ProtectedRoute>
            <ExplorePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute roles={[ 'mentor', 'mentee' ]}>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/create-mentorship"
        element={
          <ProtectedRoute roles={[ 'mentor' ]}>
            <CreateMentorshipPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-programs"
        element={
          <ProtectedRoute roles={[ 'mentor', 'mentee' ]}>
            <MyProgramsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classroom"
        element={
          <ProtectedRoute roles={[ 'mentor', 'mentee' ]}>
            {authAPI.getCurrentUser()?.role?.toLowerCase() === 'mentor' ? (
              <MentorClassroomPage />
            ) : (
              <MenteeClassroomPage />
            )}
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}

export default App

