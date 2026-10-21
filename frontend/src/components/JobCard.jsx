import React from 'react';
import { 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaClock, 
  FaBookmark, 
  FaRegBookmark, 
  FaBuilding, 
  FaTag,
  FaArrowRight,
  FaCheckCircle 
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

const JobCard = ({ job, onViewDetails, onApply, onSave, isSaved = false, isApplied = false }) => {
  if (!job) return null;

  const getImageUrl = (url, category) => {
    if (!url) return categoryImages[category] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/static/')) return url;
    if (url.startsWith('static/')) return `/${url}`;
    return url;
  };

  const displayImage = getImageUrl(job.image_url, job.category);

  return (
    <div className="glass-card h-100 d-flex flex-column justify-content-between overflow-hidden position-relative">
      
      {/* Top Job Image Banner */}
      <div className="job-img-wrapper">
        <img 
          src={displayImage} 
          alt={job.title} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = categoryImages[job.category] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <div className="job-img-overlay"></div>
        
        {/* Category Overlay Badge */}
        <div className="position-absolute top-0 start-0 m-3 z-1">
          <span className="badge bg-dark bg-opacity-75 text-white backdrop-blur border border-white border-opacity-25 rounded-pill px-3 py-1.5 extra-small fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm">
            <FaTag className="extra-small text-warning" /> {job.category}
          </span>
        </div>

        {/* Bookmark Button */}
        <div className="position-absolute top-0 end-0 m-3 z-1">
          <button 
            onClick={() => onSave && onSave(job.id)}
            className="btn btn-sm btn-dark bg-opacity-75 text-white backdrop-blur rounded-circle p-2 d-flex align-items-center justify-content-center border-0 shadow-sm"
            title={isSaved ? "Saved" : "Save Job"}
          >
            {isSaved ? <FaBookmark className="text-warning" /> : <FaRegBookmark className="text-white" />}
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 d-flex flex-column flex-grow-1 justify-content-between">
        
        <div>
          <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
            <h5 className="fw-extrabold mb-0 text-body text-truncate" title={job.title} style={{ fontSize: '1.1rem' }}>
              {job.title}
            </h5>
            <span className="pulse-indicator flex-shrink-0" title="Active Posting"></span>
          </div>

          {/* Company & Location */}
          <div className="d-flex flex-wrap align-items-center gap-3 text-body-secondary small mb-3">
            <span className="d-flex align-items-center gap-1.5 fw-medium text-body">
              <FaBuilding className="text-primary" /> {job.company_name}
            </span>
            <span className="d-flex align-items-center gap-1.5">
              <FaMapMarkerAlt className="text-danger" /> {job.location}
            </span>
          </div>

          {/* Salary & Job Type badges */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span className="badge badge-salary-glow px-3 py-1.5 rounded-3 small d-flex align-items-center gap-1.5 fw-bold">
              <FaMoneyBillWave /> {job.salary}
            </span>
            <span className="badge bg-secondary-subtle text-body border border-secondary-subtle px-2.5 py-1.5 rounded-3 small d-flex align-items-center gap-1.5 fw-medium">
              <FaClock /> {job.job_type}
            </span>
          </div>

          {/* Description preview */}
          <p className="text-body-secondary small line-clamp-2 mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '40px' }}>
            {job.description}
          </p>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <span className="text-muted extra-small" style={{ fontSize: '0.75rem' }}>
            Posted {job.created_at || 'Recently'}
          </span>

          <div className="d-flex gap-2 ms-auto">
            <button 
              onClick={() => onViewDetails(job)}
              className="btn btn-outline-custom btn-sm px-3 py-1.5"
            >
              Details
            </button>
            {isApplied ? (
              <button 
                onClick={() => onViewDetails(job)}
                className="btn btn-success btn-sm px-3 py-1.5 fw-semibold d-flex align-items-center gap-1"
                title="You have already applied for this job"
              >
                <FaCheckCircle className="extra-small" /> Applied
              </button>
            ) : (
              <button 
                onClick={() => onApply(job)}
                className="btn btn-primary-custom btn-sm px-3 py-1.5"
              >
                Apply <FaArrowRight className="extra-small ms-1" />
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default JobCard;
