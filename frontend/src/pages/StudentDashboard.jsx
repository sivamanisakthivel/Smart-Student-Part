import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentService, jobService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import JobDetailModal from '../components/JobDetailModal';
import { DashboardCardSkeleton, JobCardSkeleton } from '../components/Skeleton';
import { 
  FaUserGraduate, 
  FaClipboardList, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBookmark, 
  FaArrowRight, 
  FaUserEdit,
  FaSearch
} from 'react-icons/fa';

const StudentDashboard = ({ addToast }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await studentService.getDashboardStats();
      if (res.success) {
        setDashData(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (jobId, coverNote) => {
    setApplying(true);
    try {
      const res = await jobService.applyJob(jobId, coverNote);
      if (res.success) {
        addToast(res.message, 'success');
        setSelectedJob(null);
        fetchDashboard();
      }
    } catch (err) {
      addToast(err.customMessage || 'Failed to submit application', 'error');
    } finally {
      setApplying(false);
    }
  };

  const metrics = dashData?.metrics || {};
  const student = dashData?.student || user;
  const profileCompletion = dashData?.profile_completion || 80;
  const recommendedJobs = dashData?.recommended_jobs || [];
  const recentApps = dashData?.recent_applications || [];

  return (
    <div className="py-5">
      <div className="container">

        {/* Welcome Header */}
        <div className="glass-card p-4 p-sm-5 mb-4 position-relative overflow-hidden border-primary border-opacity-25">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 mb-2 small fw-semibold">
                Student Dashboard
              </span>
              <h2 className="fw-extrabold text-body mb-2">
                Welcome back, <span className="text-primary">{student?.full_name || 'Student'}</span>! 👋
              </h2>
              <p className="text-body-secondary mb-3">
                {student?.college} • {student?.department} Department
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/jobs" className="btn btn-primary-custom btn-sm">
                  <FaSearch /> Explore New Jobs
                </Link>
                <Link to="/student/profile" className="btn btn-outline-custom btn-sm">
                  <FaUserEdit /> Edit Profile
                </Link>
              </div>
            </div>

            {/* Profile completion badge widget */}
            <div className="col-lg-4 text-lg-end">
              <div className="p-3 bg-body-tertiary rounded-3 border border-secondary border-opacity-25 d-inline-block text-start w-100 max-w-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-bold text-body">Profile Completion</span>
                  <span className="badge bg-success-subtle text-success fw-extrabold">{profileCompletion}%</span>
                </div>
                <div className="progress mb-2" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-success rounded-pill" 
                    role="progressbar" 
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <span className="extra-small text-muted">Complete profile increases recruiter response by 3x.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="row g-4 mb-4">
          <div className="col-6 col-md-3">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-semibold">Total Applications</span>
                <div className="bg-primary-subtle text-primary p-2.5 rounded-3">
                  <FaClipboardList className="fs-5" />
                </div>
              </div>
              <h3 className="fw-extrabold text-body mb-0">
                {loading ? '...' : metrics.total_applications || 0}
              </h3>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-semibold">Pending Review</span>
                <div className="bg-warning-subtle text-warning p-2.5 rounded-3">
                  <FaClock className="fs-5" />
                </div>
              </div>
              <h3 className="fw-extrabold text-body mb-0">
                {loading ? '...' : metrics.pending_applications || 0}
              </h3>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-semibold">Accepted Applications</span>
                <div className="bg-success-subtle text-success p-2.5 rounded-3">
                  <FaCheckCircle className="fs-5" />
                </div>
              </div>
              <h3 className="fw-extrabold text-body mb-0">
                {loading ? '...' : metrics.accepted_applications || 0}
              </h3>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted small fw-semibold">Saved Bookmarks</span>
                <div className="bg-info-subtle text-info p-2.5 rounded-3">
                  <FaBookmark className="fs-5" />
                </div>
              </div>
              <h3 className="fw-extrabold text-body mb-0">
                {loading ? '...' : metrics.saved_jobs || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Recent Applications & Recommended Jobs */}
        <div className="row g-4 mb-4">
          
          {/* Recent Applications Timeline */}
          <div className="col-lg-5">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="fw-bold mb-0 text-body">Recent Applications</h5>
                <Link to="/student/applications" className="small text-primary text-decoration-none fw-semibold">
                  View All ({metrics.total_applications || 0})
                </Link>
              </div>

              {recentApps.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {recentApps.map(app => (
                    <div key={app.id} className="p-3 rounded-3 bg-body-tertiary border border-secondary border-opacity-25">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                          {app.job?.title || 'Job Position'}
                        </h6>
                        <span className={`badge-status ${app.status === 'Accepted' ? 'badge-accepted' : app.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-muted extra-small mb-1">{app.job?.company_name} • {app.job?.location}</p>
                      <span className="extra-small text-muted" style={{ fontSize: '0.75rem' }}>Applied on {app.applied_date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted small">
                  You haven't submitted any job applications yet.
                  <div className="mt-2">
                    <Link to="/jobs" className="btn btn-primary-custom btn-sm">Explore Positions</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="col-lg-7">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h5 className="fw-bold mb-0 text-body">Recommended Jobs for You</h5>
                  <span className="extra-small text-muted">Matched with your skills & location</span>
                </div>
                <Link to="/jobs" className="small text-primary text-decoration-none fw-semibold">
                  See More
                </Link>
              </div>

              <div className="row g-3">
                {recommendedJobs.slice(0, 2).map(job => (
                  <div key={job.id} className="col-md-6">
                    <JobCard
                      job={job}
                      onViewDetails={(j) => setSelectedJob(j)}
                      onApply={(j) => setSelectedJob(j)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Detail Modal */}
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

export default StudentDashboard;
