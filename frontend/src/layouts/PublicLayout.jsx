// PublicLayout.jsx - Clean public layout
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../styles/PublicLayout.css';

function PublicLayout() {
  // Set public layout class on body
  useEffect(() => {
    document.body.classList.add('public-layout');
    document.body.classList.remove('admin-layout');
    
    return () => {
      document.body.classList.remove('public-layout');
    };
  }, []);

  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;