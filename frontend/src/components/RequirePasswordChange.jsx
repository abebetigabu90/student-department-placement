import { Navigate, useLocation } from "react-router-dom";

export default function RequirePasswordChange({ children }) {
  const token = localStorage.getItem("token");
  const isDefaultPassword =
    localStorage.getItem("isDefaultPassword") === "true";

  const location = useLocation();

  // 🔴 Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔒 Must change password → block all other pages
  if (
    isDefaultPassword &&
    location.pathname !== "/student/change-password"
  ) {
    // return <Navigate to="/student/change-password" replace />;
    return (
      <Navigate
        to="/student/change-password"
        replace
        state={{
          message:
            "You must change your default password first to continue access."
        }}
      />
    );
  }

  return children;
}
