import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChartPie, 
  FaBriefcase, 
  FaUserGraduate, 
  FaClipboardList, 
  FaGlobe, 
  FaSignOutAlt 
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="glass-card p-3 h-100 d-flex flex-column justify-content-between">
      <div>
        <div className="px-3 py-2 mb-3 border-bottom border-secondary border-opacity-25">
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill mb-1">
            Admin Console
          </span>
          <h6 className="fw-extrabold text-body mb-0">Management Hub</h6>
        </div>

        <nav className="nav flex-column gap-1">
          <Link
            to="/admin/dashboard"
            className={`nav-link rounded-3 px-3 py-2.5 d-flex align-items-center gap-2.5 small fw-semibold ${isActive('/admin/dashboard') ? 'bg-primary text-white shadow-sm' : 'text-body-secondary hover-bg-tertiary'}`}
          >
            <FaChartPie /> Dashboard Overview
          </Link>

          <Link
            to="/admin/jobs"
            className={`nav-link rounded-3 px-3 py-2.5 d-flex align-items-center gap-2.5 small fw-semibold ${isActive('/admin/jobs') ? 'bg-primary text-white shadow-sm' : 'text-body-secondary hover-bg-tertiary'}`}
          >
            <FaBriefcase /> Job Postings
          </Link>

          <Link
            to="/admin/students"
            className={`nav-link rounded-3 px-3 py-2.5 d-flex align-items-center gap-2.5 small fw-semibold ${isActive('/admin/students') ? 'bg-primary text-white shadow-sm' : 'text-body-secondary hover-bg-tertiary'}`}
          >
            <FaUserGraduate /> Registered Students
          </Link>

          <Link
            to="/admin/applications"
            className={`nav-link rounded-3 px-3 py-2.5 d-flex align-items-center gap-2.5 small fw-semibold ${isActive('/admin/applications') ? 'bg-primary text-white shadow-sm' : 'text-body-secondary hover-bg-tertiary'}`}
          >
            <FaClipboardList /> Applications Review
          </Link>
        </nav>
      </div>

      <div className="pt-3 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
        <Link to="/" className="btn btn-outline-custom btn-sm w-100 text-start d-flex align-items-center gap-2">
          <FaGlobe /> Return to Website
        </Link>
        <button onClick={logout} className="btn btn-outline-danger btn-sm w-100 text-start d-flex align-items-center gap-2">
          <FaSignOutAlt /> Sign Out Admin
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
