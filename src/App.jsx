import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css"; // Icons
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { About } from "./components/about";
import { About2 } from "./components/about2";
import { Features } from "./components/features";
import Login from "./components/login";
import Register from "./components/register";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";
import ProfilePage from "./components/profile";
import Footer from "./components/footer";
import LandingPage from "./components/landing";
import Findavet from "./components/findavet";
import Shops from "./components/shops";
import PetShop from "./components/petshop";
import ShopProfile from "./components/shopprofile";
import OtpPage from "./components/otppage";
import VetLayout from "./components/VetLayout";
import VetDashboard from "./components/VetDashboard";
import VetAppointments from "./components/VetAppointments";
import VetHistory from "./components/VetHistory";
import VetClinic from "./components/vetClinic";
import GoogleAuthSuccess from "./components/googleAuthSuccess";
import { AuthProvider } from "./components/utils/auth"; // Import the AuthProvider
import ProtectedRoute from "./middleware/protectedRoute"; // Import protected route
import PublicRoute from "./middleware/publicRoute"; // Import public route

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});

  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/home"
          element={
            <>
              <Header data={landingPageData.Header} />
              <Features data={landingPageData.Features} />
              <About data={landingPageData.About} />
              <About2 data={landingPageData.About2} />
              <Footer data={landingPageData.Footer} />
            </>
          }
        />
        {/* Authentication Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
        </Route>

        <Route path="/findavet" element={<Findavet />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/petshop" element={<PetShop />} />
        <Route path="/shopprofile" element={<ShopProfile />} />
        <Route path="/otp" element={<OtpPage />} />

        {/* Vet Routes (Protected) */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "clinic"]} />}>
          <Route element={<VetLayout />}>
            <Route path="/dashboard" element={<VetDashboard />} />
            <Route path="/appointments" element={<VetAppointments />} />
            <Route path="/history" element={<VetHistory />} />
            <Route path="/vetprofile" element={<VetClinic />} />
          </Route>
        </Route>

        {/* Owner Routes (Protected) */}
        <Route element={<ProtectedRoute allowedRoles={["owner", "admin", "clinic"]} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </>
  );
};

// Wrap App in Router and AuthProvider
const AppWrapper = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default AppWrapper;