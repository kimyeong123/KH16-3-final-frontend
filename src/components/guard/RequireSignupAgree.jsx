import { Navigate } from "react-router-dom";

export default function RequireSignupAgree({ children }) {
  const agreed = sessionStorage.getItem("signup_agreed") === "true";
  if (!agreed) return <Navigate to="/signup-agreement" replace />;
  return children;
}
    