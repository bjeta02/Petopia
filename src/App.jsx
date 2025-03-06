import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { About } from "./components/about";
import { About2 } from "./components/about2";
import { Features } from "./components/features";
import { SideBar } from "./components/VetLayout";
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

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation(); // Get the current location

  useEffect(() => {
    setLandingPageData(JsonData);
    // Check if the token exists in localStorage on app load
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Update logged in state based on token presence
  }, []);


  return (
    <>
    <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        {/* Set the landing page as the default route */}
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
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/findavet" element={<Findavet />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/petshop" element={<PetShop />} />
        <Route path="/shopprofile/" element={<ShopProfile />} />
        <Route path="/otp" element={<OtpPage />} />

        
        <Route path="/clinic/*" element={<VetLayout />}>
          <Route path="dashboard" element={<VetDashboard />} />
          <Route path="appointments" element={<VetAppointments />} />
          <Route path="history" element={<VetHistory />} />
          <Route path="vetprofile" element={<VetClinic />} />
        </Route>

        {/* Profile Route */}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </> 
  );
};

// Wrap App in Router
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;