import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setLandingPageData(JsonData);
    // Check if the token exists in localStorage on app load
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // Update logged in state based on token presence
  }, []);

  return (
    <Router>
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

        {/* Profile Route */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Service Routes */}
      </Routes>
    </Router>
  );
};

export default App;
