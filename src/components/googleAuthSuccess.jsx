import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/home"); // Redirect to home page after storing data
    } else {
      navigate("/login"); // Redirect to login if not an owner
    }
  }, [location, navigate]);

  return <p>Processing login...</p>; // Temporary message while processing
};

export default GoogleAuthSuccess;
