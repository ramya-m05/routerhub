import { Navigate } from "react-router-dom";
import { getUser, getToken } from "../utils/auth";
const AdminRoute = ({ children }) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/store" replace />;
  }

  return children;
};

export default AdminRoute;