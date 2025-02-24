  import React, { useEffect, useState } from "react";
  import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
  import { Navigation } from "./components/navigation";
  import { Header } from "./components/header";
  import { About } from "./components/about";
  import { About2 } from "./components/about2";
  import { Features } from "./components/features";
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
  import SidebarLayout from './components/SideBarLayout';
  import Dashboard from './pages/Dashboard';
  import Appointments from './pages/Appointment';
  import Login from './pages/Login';
  import Signup from './pages/Signup';
  import Services from './pages/ManageClinic';
  import Logs from './pages/logs';

  export const scroll = new SmoothScroll('a[href*="#"]', {
    speed: 1000,
    speedAsDuration: true,
  });

  const App = () => {
    const [landingPageData, setLandingPageData] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
          <Route path="/shops" element={<Shops />} />
          <Route path="/petshop/:clinicId" element={<PetShop />} />
          <Route path="/shopprofile/:clinicId" element={<ShopProfile />} />

          {/* For Clinics */}
          <Route path="/" element={<SidebarLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="services" element={<Services />} />
              <Route path="logs" element={<Logs />} />
          </Route>
          <Route path="/signup" element={<Signup />} />


          {/* Profile Route */}
          <Route path="/profile" element={<ProfilePage />} />
          
        </Routes>
      </Router>
    );
  };

  export default App;
