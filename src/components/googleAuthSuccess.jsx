import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const role = params.get("role");
    const ownerId = params.get("ownerId");

    if (token && role === "owner") {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("ownerId", ownerId);

      navigate("/home"); // Redirect to home page after storing data
    } else {
      navigate("/login"); // Redirect to login if not an owner
    }
  }, [location, navigate]);

  return <p>Processing login...</p>; // Temporary message while processing
};

export default GoogleAuthSuccess;
