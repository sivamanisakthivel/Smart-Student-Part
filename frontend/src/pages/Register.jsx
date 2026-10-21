import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaPhone, 
  FaUniversity, 
  FaGraduationCap, 
  FaCode,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const Register = ({ addToast }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    college: '',
    department: '',
    skills: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setErrorMessage('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await authService.register(formData);
      if (res.success) {
        addToast(res.message, 'success');
        navigate('/verify-otp', { 
          state: { 
            email: formData.email, 
            purpose: 'register', 
            devOtp: res.dev_otp,
            registrationData: formData 
          } 
        });
      }
    } catch (err) {
      const msg = err.customMessage || err.response?.data?.message || 'Registration failed. Please check inputs.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">

            <div className="glass-card p-4 p-sm-5">
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-3 p-3 d-inline-flex mb-3 shadow-sm">
                  <FaGraduationCap className="fs-2" />
                </div>
                <h3 className="fw-extrabold text-body">Student Registration</h3>
                <p className="text-body-secondary small mb-0">Create your free account to search and apply for flexible part-time jobs.</p>
              </div>

              {/* In-page Error Banner */}
              {errorMessage && (
                <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 small d-flex align-items-center gap-2 border-danger border-opacity-25">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  <div>{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                
                {/* Full Name & Email */}
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-body">Full Name *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0 text-muted"><FaUser /></span>
                      <input 
                        type="text" 
                        name="full_name"
                        className="form-control border-start-0 ps-0 bg-transparent text-body"
                        placeholder="Siva Kumar"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-body">Email Address *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0 text-muted"><FaEnvelope /></span>
                      <input 
                        type="email" 
                        name="email"
                        className="form-control border-start-0 ps-0 bg-transparent text-body"
                        placeholder="siva@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password & Phone */}
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-body">Password *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0 text-muted"><FaLock /></span>
                      <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-control border-start-0 border-end-0 ps-0 bg-transparent text-body"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
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

                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-body">Phone Number *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0 text-muted"><FaPhone /></span>
                      <input 
                        type="tel" 
                        name="phone"
                        className="form-control border-start-0 ps-0 bg-transparent text-body"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* College & Department */}
                <div className="row g-3 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-body">College / University *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0 text-muted"><FaUniversity /></span>
                      <input 
                        type="text" 
                        name="college"
                        className="form-control border-start-0 ps-0 bg-transparent text-body"
                        placeholder="GCE Salem"
                        value={formData.college}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-body">Department / Major *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-transparent border-end-0 text-muted"><FaGraduationCap /></span>
                      <input 
                        type="text" 
                        name="department"
                        className="form-control border-start-0 ps-0 bg-transparent text-body"
                        placeholder="Computer Science"
                        value={formData.department}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-body">Key Skills (Comma separated)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 text-muted"><FaCode /></span>
                    <input 
                      type="text" 
                      name="skills"
                      className="form-control border-start-0 ps-0 bg-transparent text-body"
                      placeholder="e.g. Python, SQL, Communication, Billing, Excel"
                      value={formData.skills}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary-custom w-100 py-2.5 justify-content-center mb-3"
                  disabled={loading}
                >
                  {loading ? 'Sending Registration OTP...' : 'Register & Send 6-Digit OTP'}
                </button>
              </form>

              <div className="text-center small text-body-secondary">
                Already registered? <Link to="/login" className="fw-bold text-primary text-decoration-none">Sign In Here</Link>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
