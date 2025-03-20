// UserLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './components/navigation'; // Adjust the import path as necessary
import { Header } from './components/header'; // Adjust the import path as necessary
import Footer from './components/footer'; // Adjust the import path as necessary

const UserLayout = ({ landingPageData, isLoggedIn, setIsLoggedIn }) => {
  return (
    <div>
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Header data={landingPageData.Header} />
      <Outlet /> {/* This will render the nested routes */}
      <Footer data={landingPageData.Footer} />
    </div>
  );
};

export default UserLayout;