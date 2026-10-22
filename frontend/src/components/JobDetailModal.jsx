import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaTimes, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaClock, 
  FaTag, 
  FaCheckCircle, 
  FaPaperPlane,
  FaCalendarAlt,
  FaUserLock,
  FaUserPlus,
  FaSignInAlt,
  FaUser,
  FaPhone,
  FaGraduationCap,
  FaFileAlt,
  FaExclamationCircle,
  FaShieldAlt,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';

const categoryImages = {
  'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'Medical': 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=600&q=80',
  'Grocery Store': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
  'Hotel & Restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  'Tea & Cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
  'Supermarket': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80',
  'Tech & Data Entry': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  'Tutoring & Education': 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'
};

const JobDetailModal = ({ job, onClose, onApplySubmit, applying = false, alreadyApplied = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    college: '',
    availability: '',
    whySuitable: '',
    skillsNote: '',
    termsAgreed: false
  });
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Sync initial student details from auth context
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.full_name || '',
        phone: prev.phone || user.phone || '',
        college: prev.college || `${user.college || ''}${user.department ? ' - ' + user.department : ''}`.trim(),
        skillsNote: prev.skillsNote || user.skills || ''
      }));
    }
  }, [user]);

  if (!job) return null;

  const getImageUrl = (url, category) => {
    if (!url) return categoryImages[category] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/static/')) return url;
    if (url.startsWith('static/')) return `/${url}`;
    return url;
  };

  const displayImage = getImageUrl(job.image_url, job.category);

  // Field validator logic: No field can be empty!
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value || !value.trim()) error = 'Full Name is mandatory and cannot be empty.';
        break;
      case 'phone':
        if (!value || !value.trim()) {
          error = 'Mobile Number is mandatory and cannot be empty.';
        } else if (value.replace(/\D/g, '').length < 10) {
          error = 'Please enter a valid 10-digit mobile number.';
        }
        break;
      case 'college':
        if (!value || !value.trim()) error = 'College & Department is mandatory.';
        break;
      case 'availability':
        if (!value || !value.trim()) error = 'Please select your shift availability.';
        break;
      case 'whySuitable':
        if (!value || !value.trim()) error = 'Please describe why you are suitable for this role.';
        break;
      case 'skillsNote':
        if (!value || !value.trim()) error = 'Key skills and experience note is mandatory.';
        break;
      case 'termsAgreed':
        if (!value) error = 'You must confirm the student commitment before applying.';
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    // If user already attempted submit, validate live on change
    if (submitAttempted) {
      const err = validateField(name, val);
      setErrors(prev => ({
        ...prev,
        [name]: err
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Strict validation: Check every single field
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Construct rich application payload
    const applicationPayload = {
      full_name: formData.fullName.trim(),
      phone: formData.phone.trim(),
      college: formData.college.trim(),
      availability: formData.availability.trim(),
      why_suitable: formData.whySuitable.trim(),
      skills_note: formData.skillsNote.trim()
    };

    onApplySubmit(job.id, applicationPayload);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content glass-card border-0 shadow-lg overflow-hidden">
          
          {/* Header */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3 bg-body-tertiary">
            <div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill small fw-semibold mb-1">
                {job.category}
              </span>
              <h4 className="modal-title fw-extrabold text-primary mb-0">{job.title}</h4>
            </div>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 max-vh-75 overflow-y-auto">
            
            {/* Job Photo Banner */}
            <div className="mb-4 rounded-3 overflow-hidden shadow-sm" style={{ height: '220px' }}>
              <img 
                src={displayImage} 
                alt={job.title} 
                className="w-100 h-100 object-fit-cover"
                style={{ objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = categoryImages[job.category] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>

            {/* Quick Meta Grid */}
            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-md-3">
                <div className="p-3 rounded-3 bg-body-tertiary border border-secondary border-opacity-25 h-100">
                  <span className="text-muted extra-small d-block mb-1">Company</span>
                  <span className="fw-bold small text-body d-flex align-items-center gap-1">
                    <FaBuilding className="text-primary flex-shrink-0" /> {job.company_name}
                  </span>
                </div>
              </div>

              <div className="col-sm-6 col-md-3">
                <div className="p-3 rounded-3 bg-body-tertiary border border-secondary border-opacity-25 h-100">
                  <span className="text-muted extra-small d-block mb-1">Location</span>
                  <span className="fw-bold small text-body d-flex align-items-center gap-1">
                    <FaMapMarkerAlt className="text-danger flex-shrink-0" /> {job.location}
                  </span>
                </div>
              </div>

              <div className="col-sm-6 col-md-3">
                <div className="p-3 rounded-3 bg-body-tertiary border border-secondary border-opacity-25 h-100">
                  <span className="text-muted extra-small d-block mb-1">Stipend / Salary</span>
                  <span className="fw-bold small text-success d-flex align-items-center gap-1">
                    <FaMoneyBillWave className="flex-shrink-0" /> {job.salary}
                  </span>
                </div>
              </div>

              <div className="col-sm-6 col-md-3">
                <div className="p-3 rounded-3 bg-body-tertiary border border-secondary border-opacity-25 h-100">
                  <span className="text-muted extra-small d-block mb-1">Job Type</span>
                  <span className="fw-bold small text-body d-flex align-items-center gap-1">
                    <FaClock className="text-warning flex-shrink-0" /> {job.job_type}
                  </span>
                </div>
              </div>

              {job.owner_phone && (
                <div className="col-sm-6 col-md-3">
                  <div className="p-3 rounded-3 bg-body-tertiary border border-secondary border-opacity-25 h-100">
                    <span className="text-muted extra-small d-block mb-1">Owner Contact</span>
                    <a className="fw-bold small text-body d-flex align-items-center gap-1 text-decoration-none" href={`tel:${job.owner_phone}`}>
                      <FaPhone className="text-success flex-shrink-0" /> {job.owner_phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <h6 className="fw-bold text-body mb-2">Job Overview & Responsibilities</h6>
              <p className="text-body-secondary small leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="mb-4">
              <h6 className="fw-bold text-body mb-2">Requirements & Qualifications</h6>
              <div className="p-3 rounded-3 bg-primary-subtle border border-primary-subtle text-body">
                <ul className="list-unstyled mb-0 small d-flex flex-column gap-2">
                  {job.requirements ? job.requirements.split(',').map((req, idx) => (
                    <li key={idx} className="d-flex align-items-start gap-2">
                      <FaCheckCircle className="text-primary mt-1 flex-shrink-0" />
                      <span>{req.trim()}</span>
                    </li>
                  )) : (
                    <li className="d-flex align-items-center gap-2">
                      <FaCheckCircle className="text-primary" /> Basic communication skills & student status.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* APPLICATION SECTION */}
            
            {/* 1. GUEST / UNREGISTERED USER BARRIER */}
            {!isAuthenticated && (
              <div className="rounded-4 p-4 my-3 text-center border shadow-sm" style={{ backgroundColor: 'rgba(234, 88, 12, 0.08)', borderColor: 'rgba(234, 88, 12, 0.3)' }}>
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm" style={{ width: '60px', height: '60px', backgroundColor: '#fff3eb', color: '#ea580c' }}>
                  <FaUserLock className="fs-3" />
                </div>
                <h5 className="fw-extrabold text-body mb-2">Student Registration Required!</h5>
                <p className="text-body-secondary small mb-3 max-w-lg mx-auto leading-relaxed">
                  You cannot apply for this job without registering. Only verified college students can submit part-time job applications. Please create your student account or sign in to continue.
                </p>
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <button 
                    type="button" 
                    className="btn btn-primary-custom btn-sm px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                    onClick={() => { onClose(); navigate('/register'); }}
                  >
                    <FaUserPlus /> Register as Student (Free)
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-custom btn-sm px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                    onClick={() => { onClose(); navigate('/login'); }}
                  >
                    <FaSignInAlt /> Existing User? Sign In
                  </button>
                </div>
              </div>
            )}

            {/* 2. ADMIN USER RESTRICTION */}
            {isAuthenticated && role !== 'student' && (
              <div className="alert alert-warning d-flex align-items-center gap-3 my-3 rounded-3 shadow-sm">
                <FaExclamationTriangle className="fs-4 flex-shrink-0 text-warning" />
                <div className="small">
                  <strong>Role Notice:</strong> Administrator accounts cannot apply for student jobs. Please log in with a student account to submit applications.
                </div>
              </div>
            )}

            {/* 3. REGISTERED STUDENT APPLICATION FLOW */}
            {isAuthenticated && role === 'student' && (
              <>
                {showApplyForm ? (
                  <form onSubmit={handleSubmit} className="p-4 border border-primary border-opacity-25 rounded-4 bg-body-tertiary shadow-sm my-3 animate-fade-in">
                    
                    <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
                      <div>
                        <h6 className="fw-extrabold text-primary mb-1 d-flex align-items-center gap-2">
                          <FaPaperPlane className="small" /> {alreadyApplied ? 'Update Your Job Application' : 'Student Job Application Form'}
                        </h6>
                        <span className="text-muted extra-small">
                          * All fields are strictly mandatory. Applications with empty fields will be rejected.
                        </span>
                      </div>
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 small fw-semibold">
                        Strict Validation
                      </span>
                    </div>

                    {/* General Error Banner if submit attempted and errors exist */}
                    {submitAttempted && Object.keys(errors).length > 0 && (
                      <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3">
                        <FaExclamationCircle className="flex-shrink-0" />
                        <span><strong>Incomplete Form:</strong> Please fill in all required fields highlighted in red below.</span>
                      </div>
                    )}

                    {/* Field Grid */}
                    <div className="row g-3 mb-3">
                      
                      {/* Full Name */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-body mb-1">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className={`input-group-text bg-body-tertiary text-muted ${errors.fullName ? 'border-danger' : ''}`}>
                            <FaUser />
                          </span>
                          <input 
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className={`form-control bg-transparent text-body ${errors.fullName ? 'is-invalid border-danger' : ''}`}
                          />
                        </div>
                        {errors.fullName && (
                          <div className="text-danger extra-small mt-1 d-flex align-items-center gap-1">
                            <FaExclamationCircle /> {errors.fullName}
                          </div>
                        )}
                      </div>

                      {/* Mobile Number */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-body mb-1">
                          Mobile / WhatsApp Number <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className={`input-group-text bg-body-tertiary text-muted ${errors.phone ? 'border-danger' : ''}`}>
                            <FaPhone />
                          </span>
                          <input 
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g. 9876543210 (10 digits)"
                            className={`form-control bg-transparent text-body ${errors.phone ? 'is-invalid border-danger' : ''}`}
                          />
                        </div>
                        {errors.phone && (
                          <div className="text-danger extra-small mt-1 d-flex align-items-center gap-1">
                            <FaExclamationCircle /> {errors.phone}
                          </div>
                        )}
                      </div>

                      {/* College & Department */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-body mb-1">
                          College & Department <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className={`input-group-text bg-body-tertiary text-muted ${errors.college ? 'border-danger' : ''}`}>
                            <FaGraduationCap />
                          </span>
                          <input 
                            type="text"
                            name="college"
                            value={formData.college}
                            onChange={handleInputChange}
                            placeholder="e.g. Salem Govt Arts College - B.Sc CS"
                            className={`form-control bg-transparent text-body ${errors.college ? 'is-invalid border-danger' : ''}`}
                          />
                        </div>
                        {errors.college && (
                          <div className="text-danger extra-small mt-1 d-flex align-items-center gap-1">
                            <FaExclamationCircle /> {errors.college}
                          </div>
                        )}
                      </div>

                      {/* Available Shift Dropdown */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-body mb-1">
                          Available Shift Timings <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className={`input-group-text bg-body-tertiary text-muted ${errors.availability ? 'border-danger' : ''}`}>
                            <FaClock />
                          </span>
                          <select
                            name="availability"
                            value={formData.availability}
                            onChange={handleInputChange}
                            className={`form-select bg-transparent text-body ${errors.availability ? 'is-invalid border-danger' : ''}`}
                          >
                            <option value="">-- Select Preferred Shift (Required) --</option>
                            <option value="Evening Shift (4:00 PM - 8:00 PM)">Evening Shift (4:00 PM - 8:00 PM)</option>
                            <option value="Morning Shift (6:00 AM - 10:00 AM)">Morning Shift (6:00 AM - 10:00 AM)</option>
                            <option value="Night / Closing Shift (6:00 PM - 10:00 PM)">Night / Closing Shift (6:00 PM - 10:00 PM)</option>
                            <option value="Weekend Only (Saturday & Sunday)">Weekend Only (Saturday & Sunday)</option>
                            <option value="Flexible / Any Shift">Flexible / Any Shift</option>
                          </select>
                        </div>
                        {errors.availability && (
                          <div className="text-danger extra-small mt-1 d-flex align-items-center gap-1">
                            <FaExclamationCircle /> {errors.availability}
                          </div>
                        )}
                      </div>

                      {/* Why are you suitable */}
                      <div className="col-12">
                        <label className="form-label small fw-bold text-body mb-1">
                          Why are you suitable for this role? <span className="text-danger">*</span>
                        </label>
                        <textarea
                          name="whySuitable"
                          rows="2"
                          value={formData.whySuitable}
                          onChange={handleInputChange}
                          placeholder="Explain why you are interested in this job, your distance from location, punctuality, etc."
                          className={`form-control bg-transparent text-body ${errors.whySuitable ? 'is-invalid border-danger' : ''}`}
                        ></textarea>
                        {errors.whySuitable && (
                          <div className="text-danger extra-small mt-1 d-flex align-items-center gap-1">
                            <FaExclamationCircle /> {errors.whySuitable}
                          </div>
                        )}
                      </div>

                      {/* Key Skills & Work Experience Note */}
                      <div className="col-12">
                        <label className="form-label small fw-bold text-body mb-1">
                          Key Skills & Work Experience Note <span className="text-danger">*</span>
                        </label>
                        <textarea
                          name="skillsNote"
                          rows="2"
                          value={formData.skillsNote}
                          onChange={handleInputChange}
                          placeholder="e.g. Helper experience, customer handling, cashiering, basic computer literacy..."
                          className={`form-control bg-transparent text-body ${errors.skillsNote ? 'is-invalid border-danger' : ''}`}
                        ></textarea>
                        {errors.skillsNote && (
                          <div className="text-danger extra-small mt-1 d-flex align-items-center gap-1">
                            <FaExclamationCircle /> {errors.skillsNote}
                          </div>
                        )}
                      </div>

                      {/* Terms & Commitment Checkbox */}
                      <div className="col-12">
                        <div className={`p-3 rounded-3 border ${errors.termsAgreed ? 'border-danger bg-danger-subtle' : 'border-secondary border-opacity-25 bg-body'}`}>
                          <div className="form-check">
                            <input 
                              type="checkbox"
                              id="termsAgreed"
                              name="termsAgreed"
                              checked={formData.termsAgreed}
                              onChange={handleInputChange}
                              className={`form-check-input ${errors.termsAgreed ? 'is-invalid' : ''}`}
                            />
                            <label htmlFor="termsAgreed" className="form-check-label small text-body fw-semibold cursor-pointer">
                              <FaShieldAlt className="text-primary me-1" />
                              I confirm that I am a college student and will strictly adhere to the employer's shift schedule.
                            </label>
                          </div>
                        </div>
                        {errors.termsAgreed && (
                          <div className="text-danger extra-small mt-1 d-flex align-items-center gap-1">
                            <FaExclamationCircle /> {errors.termsAgreed}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Action buttons */}
                    <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                      <button 
                        type="button" 
                        className="btn btn-outline-custom btn-sm px-3" 
                        onClick={() => setShowApplyForm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary-custom btn-sm px-4 fw-bold shadow-sm"
                        disabled={applying}
                      >
                        {applying ? (
                          <>
                            <FaSpinner className="fa-spin me-1.5" /> Submitting Application...
                          </>
                        ) : alreadyApplied ? (
                          <>
                            <FaPaperPlane className="me-1.5" /> Update Application
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="me-1.5" /> Submit Application Now
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                ) : alreadyApplied ? (
                  <div className="alert alert-success d-flex align-items-center justify-content-between my-3 p-3 rounded-3 shadow-sm">
                    <div className="d-flex align-items-center gap-3">
                      <FaCheckCircle className="fs-3 text-success flex-shrink-0" />
                      <div>
                        <strong className="d-block">Application Submitted!</strong>
                        <span className="small text-body-secondary">
                          Your application has been received by the employer. You can update your submission if needed.
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-success fw-bold px-3 py-1.5"
                      onClick={() => setShowApplyForm(true)}
                    >
                      Update Application Details
                    </button>
                  </div>
                ) : null}
              </>
            )}

          </div>

          {/* Footer Actions */}
          <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3 bg-body-tertiary d-flex justify-content-between align-items-center">
            <span className="text-muted extra-small">
              <FaCalendarAlt className="me-1" /> Posted {job.created_at || 'Recently'}
            </span>

            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-custom btn-sm px-3" onClick={onClose}>
                Close
              </button>

              {/* If user is unregistered, prompt to register or login */}
              {!isAuthenticated && (
                <button 
                  type="button" 
                  className="btn btn-primary-custom btn-sm px-4 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
                  onClick={() => {
                    onClose();
                    navigate('/register');
                  }}
                >
                  <FaUserLock className="extra-small" /> Register to Apply
                </button>
              )}

              {/* If user is registered student and form not currently opened */}
              {isAuthenticated && role === 'student' && !showApplyForm && (
                <button 
                  type="button" 
                  className={`btn btn-sm px-4 fw-bold shadow-sm ${alreadyApplied ? 'btn-outline-success' : 'btn-primary-custom'}`}
                  onClick={() => setShowApplyForm(true)}
                >
                  {alreadyApplied ? (
                    <>
                      <FaCheckCircle className="me-1.5 extra-small" /> Applied (Update Note)
                    </>
                  ) : (
                    <>
                      Apply Now <FaPaperPlane className="ms-1.5 extra-small" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
