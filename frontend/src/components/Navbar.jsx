import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FaGraduationCap, 
  FaSun, 
  FaMoon, 
  FaUser, 
  FaSignOutAlt, 
  FaBriefcase, 
  FaUserShield,
  FaBars,
  FaTimes,
  FaBookmark,
  FaClipboardList
} from 'react-icons/fa';

const Navbar = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky-top glass-header">
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between">
          
          {/* Logo */}
          <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }}>
              <FaGraduationCap className="fs-4" />
            </div>
            <div>
              <span className="fw-extrabold fs-5 tracking-tight text-primary">Smart<span className="text-body fw-bold">Jobs</span></span>
                     {/* <span className="text-gradient-primary">Part-Time Jobs</span>  */}
              <span className="badge bg-primary-subtle text-gradient-primary border border-primary-subtle ms-2 d-none d-sm-inline-block small">Smart Student Part-Time Jobs Management</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-md-flex align-items-center gap-4">
            <Link 
              to="/" 
              className={`text-decoration-none fw-medium ${isActive('/') ? 'text-primary border-bottom border-primary border-2 pb-1' : 'text-body-secondary'}`}
            >
              Home
            </Link>

            <Link 
              to="/jobs" 
              className={`text-decoration-none fw-medium ${isActive('/jobs') ? 'text-primary border-bottom border-primary border-2 pb-1' : 'text-body-secondary'}`}
            >
              Explore Jobs
            </Link>

            {role === 'student' && (
              <>
                <Link 
                  to="/student/dashboard" 
                  className={`text-decoration-none fw-medium ${isActive('/student/dashboard') ? 'text-primary border-bottom border-primary border-2 pb-1' : 'text-body-secondary'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/student/applications" 
                  className={`text-decoration-none fw-medium ${isActive('/student/applications') ? 'text-primary border-bottom border-primary border-2 pb-1' : 'text-body-secondary'}`}
                >
                  My Applications
                </Link>
              </>
            )}

            {role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                className={`text-decoration-none fw-medium text-warning ${isActive('/admin/dashboard') ? 'border-bottom border-warning border-2 pb-1' : ''}`}
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Auth Controls */}
          <div className="d-flex align-items-center gap-3">
            
            {/* Animated Sliding Theme Switcher Toggle */}
            <div className="theme-switch-wrapper me-1">
              <div 
                className="theme-switch" 
                onClick={toggleTheme}
                title={`Current: ${theme === 'light' ? 'Light Mode (☀️ Light)' : 'Dark Mode (🌙 Dark)'} - Click to switch`}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleTheme()}
              >
                <div className="theme-switch-thumb">
                  {theme === 'light' ? (
                    <FaSun className="theme-switch-icon text-warning" />
                  ) : (
                    <FaMoon className="theme-switch-icon text-white" />
                  )}
                </div>
                <div className="theme-switch-label">
                  <span style={{ opacity: theme === 'light' ? 1 : 0.4 }}>☀️</span>
                  <span style={{ opacity: theme === 'dark' ? 1 : 0.4 }}>🌙</span>
                </div>
              </div>
            </div>

            {/* Authenticated User Menu */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-custom rounded-pill dropdown-toggle d-flex align-items-center gap-2 px-3 py-1"
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center small fw-bold" style={{ width: '28px', height: '28px' }}>
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="fw-semibold small d-none d-sm-inline">{user?.full_name?.split(' ')[0]}</span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end glass-card shadow-lg mt-2 p-2" style={{ minWidth: '200px' }}>
                  <li className="px-3 py-2 border-bottom border-secondary border-opacity-25 mb-1">
                    <p className="fw-bold mb-0 small">{user?.full_name}</p>
                    <p className="text-muted mb-0 extra-small" style={{ fontSize: '0.75rem' }}>{user?.email}</p>
                  </li>

                  {role === 'student' && (
                    <>
                      <li>
                        <Link to="/student/dashboard" className="dropdown-item py-2 extra-small fw-semibold d-flex align-items-center gap-2">
                          <FaUser className="text-primary" /> Student Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link to="/student/applications" className="dropdown-item py-2 extra-small fw-semibold d-flex align-items-center gap-2">
                          <FaClipboardList className="text-success" /> My Applications
                        </Link>
                      </li>
                      <li>
                        <Link to="/student/saved-jobs" className="dropdown-item py-2 extra-small fw-semibold d-flex align-items-center gap-2">
                          <FaBookmark className="text-warning" /> Saved Jobs
                        </Link>
                      </li>
                    </>
                  )}

                  {role === 'admin' && (
                    <>
                      <li>
                        <Link to="/admin/dashboard" className="dropdown-item py-2 extra-small fw-semibold d-flex align-items-center gap-2">
                          <FaUserShield className="text-warning" /> Admin Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/jobs" className="dropdown-item py-2 extra-small fw-semibold d-flex align-items-center gap-2">
                          <FaBriefcase className="text-primary" /> Manage Jobs
                        </Link>
                      </li>
                    </>
                  )}

                  <li><hr className="dropdown-divider opacity-25" /></li>

                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item py-2 extra-small fw-semibold text-danger d-flex align-items-center gap-2"
                    >
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-none d-sm-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-custom btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary-custom btn-sm">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-outline-custom btn-sm p-2 d-md-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="d-md-none pt-3 mt-3 border-top border-secondary border-opacity-25 animate-fade-in-up">
            <div className="d-flex flex-column gap-2">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-decoration-none fw-medium py-2 px-3 rounded-3 ${isActive('/') ? 'bg-primary-subtle text-primary' : 'text-body-secondary'}`}
              >
                Home
              </Link>
              <Link 
                to="/jobs" 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-decoration-none fw-medium py-2 px-3 rounded-3 ${isActive('/jobs') ? 'bg-primary-subtle text-primary' : 'text-body-secondary'}`}
              >
                Explore Jobs
              </Link>

              {role === 'student' && (
                <>
                  <Link 
                    to="/student/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-decoration-none fw-medium py-2 px-3 rounded-3 ${isActive('/student/dashboard') ? 'bg-primary-subtle text-primary' : 'text-body-secondary'}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/student/applications" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-decoration-none fw-medium py-2 px-3 rounded-3 ${isActive('/student/applications') ? 'bg-primary-subtle text-primary' : 'text-body-secondary'}`}
                  >
                    My Applications
                  </Link>
                  <Link 
                    to="/student/saved-jobs" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-decoration-none fw-medium py-2 px-3 rounded-3 ${isActive('/student/saved-jobs') ? 'bg-primary-subtle text-primary' : 'text-body-secondary'}`}
                  >
                    Saved Jobs
                  </Link>
                </>
              )}

              {!isAuthenticated && (
                <div className="d-flex gap-2 pt-2 border-top border-secondary border-opacity-25">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline-custom btn-sm w-50 justify-content-center">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary-custom btn-sm w-50 justify-content-center">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;
