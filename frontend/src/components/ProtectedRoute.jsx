import { Navigate } from "react-router-dom";
import { getUser, getToken } from "../utils/auth";

function ProtectedRoute({ children }) {
  const token = getToken();
  const user = getUser();

  if (!token || token === "undefined" || !user) {
    localStorage.clear(); // optional but good
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;