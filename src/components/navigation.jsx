import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, getUserFromToken } from "../components/utils/auth";

export const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(''); // State to hold the avatar URL
  const { role, ownerId, clinicId, setUserInfo} = useAuth(); // ✅ Get user info

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Retrieve the avatar from local storage
    const ownerData = localStorage.getItem("owner");
    if (ownerData) {
      const owner = JSON.parse(ownerData);
      setAvatar(owner.avatar); // Set the avatar URL from owner data
    }

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
    console.log("Owner ID:", ownerId); // Check if ownerId is available
    console.log("Role:", role); // Check if role is available
  }, [ownerId, role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserInfo({ userId: null, ownerId: null, clinicId: null, role: null }); // Reset user info
    setIsLoggedIn(false);
    setAvatar(''); // Reset avatar state
    navigate('/login');
};

const closeNavbar = () => {
  const navbarCollapse = document.getElementById("bs-example-navbar-collapse-1");
  if (navbarCollapse) {
    navbarCollapse.classList.remove("in"); // Bootstrap 3 (for collapsing menu)
  }
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
    console.log("ownerId", ownerId);
    if (role === 'owner') {
      navigate(`/profile`); // Navigate to the profile page with owner ID
    } else {
      navigate(`/vetprofile`);
    }
  };

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
              {isLoggedIn ? (
                <>
                  <li>
                    <a onClick={() => { navigate('/home'); closeNavbar(); }} style={styles.navLink}>Home</a>
                  </li>
                  <li>
                    <a onClick={() => { handleProfileClick(); closeNavbar(); }} style={styles.navLink}>Profile</a>
                  </li>
                  <li>
                    <a onClick={() => { handleLogout(); closeNavbar(); }} style={styles.navLink}>Logout</a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a href="/#header" className="page-scroll" style={styles.navLink} onClick={closeNavbar}>
                      Home
                    </a>
                  </li>
                  <li>
                    <Link to="/login" style={styles.navLink} onClick={closeNavbar}>
                      Log In
                    </Link>
                  </li>
                </>
              )}
            </ul>

        </div>

      </div>
    </nav>
  );
};