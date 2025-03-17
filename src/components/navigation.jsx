import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Navigation = ({ onLoginSuccess }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLoginStatus(); // Check login status on component mount

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (onLoginSuccess) {
      onLoginSuccess(); // Call the function passed from Login component
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ownerId"); // Clear owner data on logout
    localStorage.removeItem("role");
    localStorage.removeItem("clinicId");
    setIsLoggedIn(false);
    navigate('/login');
  };

  const styles = {
    navbar: {
      backgroundColor: 'rgba(255, 255, 255, 0.71)',
      backdropFilter: 'blur(10px)',
      border: 'none',
      transition: 'background-color 0.3s',
      position: 'fixed',
      width: '100%',
      zIndex: 1000,
      top: '0px',
    },
    navLink: {
      color: 'black',
      fontWeight: "bold",
      transition: 'color 0.3s',
      cursor: 'pointer',
      padding: '5px 5px',
      display: 'block',
    },
    dropdown: {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      zIndex: 1001,
      marginTop: '10px',
      display: dropdownVisible ? 'block' : 'none',
    },
    dropdownItem: {
      padding: '10px 20px',
      cursor: 'pointer',
      color: 'black',
    },
    logo: {
      margin: '-20px',
      height: '60px',
      width: 'auto',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      cursor: 'pointer',
      marginTop: '10px',
    },
  };

  const handleAvatarClick = () => {
    setDropdownVisible(true);
  };

  const handleProfileClick = () => {
    const ownerId = localStorage.getItem('ownerId'); // Retrieve owner ID from local storage
    if (ownerId) {
      navigate(`/profile?id=${ownerId}`); // Navigate to the profile page with owner ID
    }
  };

  // Check if clinicId exists in local storage
  const hasClinicId = !!localStorage.getItem('clinicId');

  return (
    <nav id="menu" className="navbar navbar-default" style={styles.navbar}>
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand page-scroll" href="/home">
            <img src={require('../assets/Logo.png')} alt="Petopia Logo" style={styles.logo} />
          </a>
        </div>

        <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
          <ul className="nav navbar-nav navbar-right">
            {!isLoggedIn && (
              <>
                <li>
                  <a href="/#header" className="page-scroll" style={styles.navLink}>
                    Home
                  </a>
                </li>
                <li>
                  <Link to="/login" style={styles.navLink}>
                    Log In
                  </Link>
                </li>
              </>
            )}

            {isLoggedIn && (
              <li style={{ position: 'relative' }} ref={dropdownRef}>
                <img
                  src="/img/profile.jpg" // Default avatar URL
                  alt="Profile"
                  style={styles.avatar}
                  onClick={handleAvatarClick}
                />

                {dropdownVisible && (
                  <div style={styles.dropdown}>
                    <div style={styles.dropdownItem} onClick={() => navigate('/home')}>
                      Home
                    </div>
                    {!hasClinicId && (
                      <div style={styles.dropdownItem} onClick={handleProfileClick}>
                        Profile
                      </div>
                    )}
                    <div style={styles.dropdownItem} onClick={handleLogout}>
                      Logout
                    </div>
                  </div>  
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};