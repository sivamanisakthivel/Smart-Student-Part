import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaKey, FaClock, FaRedo, FaCheckCircle, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

const OTPVerify = ({ addToast }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthSession, pendingOtpEmail } = useAuth();

  const email = location.state?.email || pendingOtpEmail;
  const purpose = location.state?.purpose || 'login';
  const registrationData = location.state?.registrationData || null;

  const [devOtp, setDevOtp] = useState(location.state?.devOtp || null);

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpCode || otpCode.length !== 6) {
      setErrorMessage('Please enter complete 6-digit OTP code.');
      addToast('Please enter complete 6-digit OTP code', 'error');
      return;
    }

    if (timeLeft === 0) {
      setErrorMessage('OTP code has expired (5-minute limit). Please click Resend OTP.');
      addToast('OTP has expired. Please click Resend OTP.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOTP({ 
        email, 
        otp_code: otpCode,
        purpose,
        registration_data: registrationData 
      });

      if (res.success) {
        addToast(res.message || 'OTP Verified successfully!', 'success');
        setAuthSession(res.token, res.user, 'student');
        navigate('/student/dashboard');
      }
    } catch (err) {
      const msg = err.customMessage || err.response?.data?.message || 'Invalid OTP code';
      setErrorMessage(msg);
      addToast(msg, 'error');
      setAttemptsLeft(prev => Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMessage('');
    try {
      const res = await authService.resendOTP({ email, purpose });
      if (res.success) {
        addToast(res.message, 'success');
        setTimeLeft(300); // reset 5 mins
        setAttemptsLeft(3);
        if (res.data?.dev_otp) setDevOtp(res.data.dev_otp);
      }
    } catch (err) {
      const msg = err.customMessage || 'Failed to resend OTP';
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="py-5 min-vh-75 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">

            <div className="glass-card p-4 p-sm-5">
              <div className="text-center mb-4">
                <div className="bg-primary-subtle text-primary rounded-circle p-3 d-inline-flex mb-3 shadow-sm" style={{ width: '64px', height: '64px' }}>
                  <FaKey className="fs-2" />
                </div>
                <h3 className="fw-extrabold text-body">
                  {purpose === 'register' ? 'Confirm Registration' : 'Login OTP Verification'}
                </h3>
                <p className="text-body-secondary small mb-0">
                  Enter 6-digit code sent to <strong className="text-body">{email}</strong>
                </p>
              </div>

              {/* In-page Error Banner */}
              {errorMessage && (
                <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 small d-flex align-items-center gap-2 border-danger border-opacity-25">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  <div>{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleVerify}>
                <div className="mb-4">
                  <input 
                    type="text" 
                    className="form-input-custom text-center fw-extrabold fs-3 letter-spacing-3 py-2.5"
                    maxLength="6"
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/[^0-9]/g, '')); setErrorMessage(''); }}
                    autoFocus
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary-custom w-100 py-2.5 justify-content-center mb-3"
                  disabled={loading || timeLeft === 0 || attemptsLeft === 0}
                >
                  {loading ? 'Verifying Code...' : 'Verify & Access Dashboard'}
                </button>
              </form>

              {/* Timer and Expiry Meta */}
              <div className="d-flex align-items-center justify-content-between text-body-secondary small p-3 bg-body-tertiary rounded-3 border border-secondary border-opacity-25 mb-4">
                <div className="d-flex align-items-center gap-1.5">
                  <FaClock className={timeLeft > 60 ? "text-primary" : "text-danger"} /> 
                  <span>Expires in: <strong className="text-body">{formatTime(timeLeft)}</strong></span>
                </div>

                <div className="d-flex align-items-center gap-1.5">
                  <FaShieldAlt className="text-warning" />
                  <span>Attempts: <strong className="text-body">{attemptsLeft}/3</strong></span>
                </div>
              </div>

              {/* Resend Action */}
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={handleResend}
                  className="btn btn-link text-decoration-none small p-0 text-primary fw-semibold d-inline-flex align-items-center gap-1"
                  disabled={resending}
                >
                  <FaRedo className={resending ? "spin" : ""} /> {resending ? 'Resending OTP...' : 'Resend Real-time OTP Code'}
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;
