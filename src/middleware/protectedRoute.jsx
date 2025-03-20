import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../components/utils/auth"; // Adjust path if needed

const ProtectedRoute = ({ allowedRoles }) => {
  const { role } = useAuth(); 

  // Redirect to login if not authenticated
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if user doesn't have the right role
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />; // Change to "/unauthorized" if you have that page
  } 

  return <Outlet />;
};

export default ProtectedRoute;
