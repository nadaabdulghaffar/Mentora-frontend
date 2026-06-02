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
import MyProgramsPage from "./pages/MyProgramsPage";
import MyRoadmapsPage from "./pages/roadmap/MyRoadmapsPage";
import CreateRoadmapPage from "./pages/roadmap/CreateRoadmapPage";
import EditRoadmapPage from "./pages/roadmap/EditRoadmapPage";
import RoadmapViewPage from "./pages/roadmap/RoadmapViewPage";
import CommunityPage from "./pages/community/CommunityPage";
import MentoAIPage from "./pages/MentoAIPage";

import MyCommunitiesPage from "./pages/community/MyCommunitiesPage";


import CommunitiesListPage from "./pages/community/CommunitiesListPage";
import ProfilePage from "./pages/profile/ProfilePage";
import SuggestedProgramsPage from "./pages/SuggestedProgramsPage";
import RecommendedMentorsPage from "./pages/RecommendedMentorsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import ManageApplicantsPage from "./pages/ManageApplicantsPage";
import ApplicationDetailsPage from "./pages/ApplicationDetailsPage";
import authAPI from './services/authService';
import MentorClassroomPage from './pages/classroom/MentorClassroomPage';
import MenteeClassroomPage from './pages/classroom/MenteeClassroomPage';
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingRoute from "./components/OnboardingRoute";
import NotificationsTestPage from "./pages/dev/NotificationsTestPage";


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
        path="/roadmap"
        element={
          <ProtectedRoute roles={[ 'mentor' ]}>
            <Navigate to="/my-roadmaps" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-roadmaps"
        element={
          <ProtectedRoute roles={[ 'mentor' ]}>
            <MyRoadmapsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap/create"
        element={
          <ProtectedRoute roles={[ 'mentor' ]}>
            <CreateRoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap/:roadmapId/edit"
        element={
          <ProtectedRoute roles={[ 'mentor' ]}>
            <EditRoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap/:roadmapId"
        element={
          <ProtectedRoute roles={[ 'mentor', 'mentee' ]}>
            <RoadmapViewPage />
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
        path="/profile"
        element={
          <ProtectedRoute roles={['mentor', 'mentee']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute roles={['mentor', 'mentee']}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      {/* Create mentorship now opens as a modal from the TopBar; the standalone page was removed. */}
      <Route
        path="/my-programs"
        element={
          <ProtectedRoute roles={[ 'mentor', 'mentee' ]}>
            <MyProgramsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute roles={['mentor', 'mentee']}>
            <MyApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:id/manage"
        element={
          <ProtectedRoute roles={['mentor']}>
            <ManageApplicantsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:id"
        element={
          <ProtectedRoute roles={['mentor', 'mentee']}>
            <ApplicationDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mento-ai"
        element={
          <ProtectedRoute roles={["mentee"]}>
            <MentoAIPage />
          </ProtectedRoute>
        }
      />
      <Route
  path="/classroom/:programId"
  element={
    <ProtectedRoute roles={['mentor', 'mentee']}>
      {authAPI.getCurrentUser()?.role?.toLowerCase() === 'mentor' ? (
        <MentorClassroomPage />
      ) : (
        <MenteeClassroomPage />
      )}
    </ProtectedRoute>
  }
/>
      <Route
        path="/community"
        element={
          <ProtectedRoute roles={[ 'mentor', 'mentee' ]}>
            <CommunitiesListPage />
          </ProtectedRoute>
        }
      />

<Route
  path="/my-communities"
  element={
    <ProtectedRoute roles={[ 'mentor', 'mentee' ]}>
      <MyCommunitiesPage />
    </ProtectedRoute>
  }
/>

      {/* Dev-only route: preview community page without auth (remove before production) */}
      <Route path="/dev-community" element={<CommunityPage />} />
      {import.meta.env.DEV && (
        <Route
          path="/dev-notifications"
          element={
            <ProtectedRoute roles={["mentor", "mentee"]}>
              <NotificationsTestPage />
            </ProtectedRoute>
          }
        />
      )}
      <Route
        path="/community/:id"
        element={
          <ProtectedRoute roles={[ 'mentor', 'mentee' ]}>
            <CommunityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suggested-programs"
        element={
          <ProtectedRoute roles={[ 'mentee' ]}>
            <SuggestedProgramsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommended-mentors"
        element={
          <ProtectedRoute roles={[ 'mentee' ]}>
            <RecommendedMentorsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App

