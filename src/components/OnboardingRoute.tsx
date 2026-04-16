import { Navigate } from "react-router-dom";

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // لو المستخدم already logged in وخلص onboarding
  if (token && user?.role) {
    if (user.role.toLowerCase() === "mentor") {
      return <Navigate to="/mentor/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default OnboardingRoute;