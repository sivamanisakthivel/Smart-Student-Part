import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FaEnvelope, 
  FaLock, 
  FaGraduationCap, 
  FaArrowRight, 
  FaShieldAlt, 
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const Login = ({ addToast }) => {
  const navigate = useNavigate();
  const { setPendingOtpEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      addToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      if (res.success) {
        addToast(res.message, 'success');
        setPendingOtpEmail(email);
        
        navigate('/verify-otp', { 
          state: { 
            email, 
            purpose: 'login',
            devOtp: res.dev_otp || res.data?.dev_otp 
          } 
        });
      }
    } catch (err) {
      const msg = err.customMessage || err.response?.data?.message || 'Invalid email or password';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 min-vh-75 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            
            <div className="glass-card p-4 p-sm-5">
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-3 p-3 d-inline-flex mb-3 shadow-sm">
                  <FaGraduationCap className="fs-2" />
                </div>
                <h3 className="fw-extrabold text-body">Student Login</h3>
                <p className="text-body-secondary small mb-0">Step 1 of 2: Enter registered credentials</p>
              </div>

              {/* In-page Error Banner */}
              {errorMessage && (
                <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 small d-flex align-items-center gap-2 border-danger border-opacity-25">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  <div>{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-body">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 text-muted"><FaEnvelope /></span>
                    <input 
                      type="email" 
                      className="form-control border-start-0 ps-0 bg-transparent text-body"
                      placeholder="e.g. siva@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                      required
                    />
                  </div>
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
                      onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
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
                  className="btn btn-primary-custom w-100 py-2.5 justify-content-center mb-3"
                  disabled={loading}
                >
                  {loading ? 'Validating...' : 'Continue to OTP Verification'} <FaArrowRight className="ms-1 extra-small" />
                </button>
              </form>

              <div className="p-3 bg-body-tertiary rounded-3 border border-secondary border-opacity-25 mb-4 text-center">
                <span className="extra-small text-body-secondary d-flex align-items-center justify-content-center gap-1">
                  <FaShieldAlt className="text-primary" /> Protected with 6-Digit Email OTP Security
                </span>
              </div>

              <div className="text-center small text-body-secondary">
                Don't have a student account? <Link to="/register" className="fw-bold text-primary text-decoration-none">Register Here</Link>
              </div>
              <div className="text-center mt-2 extra-small text-muted">
                Admin access? <Link to="/admin/login" className="text-warning text-decoration-none fw-semibold">Admin Sign In</Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
