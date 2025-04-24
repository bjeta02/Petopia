import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../components/utils/auth";

const PublicRoute = () => {
  const { userId, role } = useAuth(); // Get user role

  console.log("🔒 PublicRoute - UserID:", userId, "Role:", role); // Debugging

  if (userId) {
    // Redirect based on role
    return role === "admin" || role === "clinic" ? (
      <Navigate to="/vet-dashboard" replace />
    ) : (
      <Navigate to="/home" replace />
    );
  }

  return <Outlet />; // Allow access to login/register if not logged in
};

export default PublicRoute;
