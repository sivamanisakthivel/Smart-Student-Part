import React, { useState, useEffect } from 'react';
import { studentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaUniversity, FaGraduationCap, FaCode, FaSave } from 'react-icons/fa';

const StudentProfile = ({ addToast }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    skills: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await studentService.getProfile();
      if (res.success) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await studentService.updateProfile(profile);
      if (res.success) {
        addToast(res.message, 'success');
      }
    } catch (err) {
      addToast(err.customMessage || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container max-w-2xl">
        
        <div className="glass-card p-4 p-sm-5">
          <div className="d-flex align-items-center gap-3 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
            <div className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: '56px', height: '56px' }}>
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h3 className="fw-extrabold text-body mb-0">Student Profile</h3>
              <p className="text-body-secondary small mb-0">Update your college, contact info, and skills tag</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted">Loading profile info...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              
              <div className="mb-3">
                <label className="form-label small fw-semibold text-body">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted"><FaUser /></span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0 bg-transparent text-body"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-body">Email Address (Read-Only)</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted"><FaEnvelope /></span>
                  <input 
                    type="email" 
                    className="form-control border-start-0 ps-0 bg-transparent text-muted"
                    value={profile.email}
                    disabled
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-body">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted"><FaPhone /></span>
                  <input 
                    type="tel" 
                    className="form-control border-start-0 ps-0 bg-transparent text-body"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-body">College / University</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 text-muted"><FaUniversity /></span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 ps-0 bg-transparent text-body"
                      value={profile.college}
                      onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="col-sm-6">
                  <label className="form-label small fw-semibold text-body">Department</label>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-end-0 text-muted"><FaGraduationCap /></span>
                    <input 
                      type="text" 
                      className="form-control border-start-0 ps-0 bg-transparent text-body"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-body">Skills & Technical Competencies</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted"><FaCode /></span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 ps-0 bg-transparent text-body"
                    placeholder="Python, Billing, Communication, MS Excel"
                    value={profile.skills}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary-custom w-100 py-2.5 justify-content-center"
                disabled={saving}
              >
                <FaSave /> {saving ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default StudentProfile;
