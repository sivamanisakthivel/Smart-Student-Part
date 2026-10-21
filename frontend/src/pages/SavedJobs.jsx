import React, { useState, useEffect } from 'react';
import { studentService, jobService } from '../services/api';
import JobCard from '../components/JobCard';
import JobDetailModal from '../components/JobDetailModal';
import { FaBookmark, FaInbox } from 'react-icons/fa';

const SavedJobs = ({ addToast }) => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const res = await studentService.getSavedJobs();
      if (res.success) {
        setSavedJobs(res.data);
      }
    } catch (err) {
      console.error('Error loading saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      const res = await jobService.toggleSaveJob(jobId);
      if (res.success) {
        addToast(res.message, 'success');
        setSavedJobs(prev => prev.filter(item => item.job_id !== jobId));
      }
    } catch (err) {
      addToast(err.customMessage || 'Failed to remove saved job', 'error');
    }
  };

  const handleApplySubmit = async (jobId, coverNote) => {
    setApplying(true);
    try {
      const res = await jobService.applyJob(jobId, coverNote);
      if (res.success) {
        addToast(res.message, 'success');
        setSelectedJob(null);
      }
    } catch (err) {
      addToast(err.customMessage || 'Failed to submit application', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="fw-extrabold text-body mb-1">Saved Jobs</h2>
            <p className="text-body-secondary small mb-0">Your bookmarked part-time positions for quick access.</p>
          </div>
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-1.5 fw-semibold">
            <FaBookmark className="me-1" /> {savedJobs.length} Bookmarks
          </span>
        </div>

        {loading ? (
          <div className="glass-card p-5 text-center text-muted">
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <p className="mb-0">Loading saved jobs...</p>
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="row g-4">
            {savedJobs.map(item => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <JobCard 
                  job={item.job}
                  onViewDetails={(j) => setSelectedJob(j)}
                  onApply={(j) => setSelectedJob(j)}
                  onSave={() => handleUnsave(item.job_id)}
                  isSaved={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-5 text-center">
            <FaInbox className="fs-1 text-muted mb-3" />
            <h5 className="fw-bold mb-2">No Saved Jobs Yet</h5>
            <p className="text-body-secondary small mb-0">Click the bookmark icon on any job card to save positions here.</p>
          </div>
        )}

      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplySubmit={handleApplySubmit}
          applying={applying}
        />
      )}
    </div>
  );
};

export default SavedJobs;
