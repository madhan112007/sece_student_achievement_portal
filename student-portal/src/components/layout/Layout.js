import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (!currentUser) {
    return children;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <nav className="navbar">
        <div className="navbar-content">
          <h1>Sri Eshwar College Portal</h1>
          <div className="user-info">
            <span style={{ fontSize: '14px', color: '#666' }}>
              {currentUser.email} ({userRole})
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-primary"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main style={{ padding: '20px 0' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;