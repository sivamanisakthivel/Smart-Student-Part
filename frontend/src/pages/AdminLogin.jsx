import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUserShield, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminLogin = ({ addToast }) => {
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await adminService.login({ email, password });
      if (res.success) {
        addToast(res.message, 'success');
        setAuthSession(res.token, res.user, 'admin');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      addToast(err.customMessage || 'Invalid admin credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 min-vh-75 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">

            <div className="glass-card p-4 p-sm-5 border-warning border-opacity-25">
              <div className="text-center mb-4">
                <div className="bg-warning-subtle text-warning rounded-circle p-3 d-inline-flex mb-3 shadow-sm" style={{ width: '64px', height: '64px' }}>
                  <FaUserShield className="fs-2" />
                </div>
                <h3 className="fw-extrabold text-body">Admin Portal Login</h3>
                <p className="text-body-secondary small">System Administrator Access</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-body">Username or Email</label>
                  <input 
                    type="text" 
                    className="form-input-custom"
                    placeholder="admin@jobportal.com or admin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-body">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 text-muted"><FaLock /></span>
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="form-control border-start-0 border-end-0 ps-0 bg-transparent text-body"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="input-group-text bg-transparent border-start-0 text-muted cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-warning w-100 py-2.5 fw-bold text-dark justify-content-center mb-3"
                  disabled={loading}
                >
                  <FaSignInAlt className="me-1" /> {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
                </button>
              </form>

              <div className="p-3 bg-body-tertiary rounded-3 border border-secondary border-opacity-25 text-center extra-small text-muted">
                Default Credentials: Username <strong>admin</strong> | Password <strong>admin123</strong>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
