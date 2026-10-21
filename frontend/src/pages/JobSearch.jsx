import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { jobService, studentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import JobDetailModal from '../components/JobDetailModal';
import { JobCardSkeleton } from '../components/Skeleton';
import { 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown, 
  FaRedo, 
  FaMapMarkerAlt,
  FaInbox,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const JobSearch = ({ addToast }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  
  // Extract initial values from URL searchParams
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [location, setLocation] = useState(() => searchParams.get('location') || '');
  const [category, setCategory] = useState(() => searchParams.get('category') || 'all');
  const [jobType, setJobType] = useState(() => searchParams.get('job_type') || 'all');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort_by') || 'latest');
  const [page, setPage] = useState(1);

  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // Sync state with URL searchParams when user navigates or passes query params
  useEffect(() => {
    const searchUrl = searchParams.get('search') || '';
    const locationUrl = searchParams.get('location') || '';
    const categoryUrl = searchParams.get('category') || 'all';
    const jobTypeUrl = searchParams.get('job_type') || 'all';
    const sortByUrl = searchParams.get('sort_by') || 'latest';

    setSearch(searchUrl);
    setLocation(locationUrl);
    setCategory(categoryUrl);
    setJobType(jobTypeUrl);
    setSortBy(sortByUrl);
    setPage(1);
  }, [searchParams]);

  // Load available categories
  useEffect(() => {
    jobService.getCategories()
      .then(res => {
        if (res.success) setCategories(res.data);
      })
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  // Fetch jobs whenever filters or pagination changes
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search,
        location,
        category: category !== 'all' ? category : '',
        job_type: jobType !== 'all' ? jobType : '',
        sort_by: sortBy,
        page,
        per_page: 9
      };
      const res = await jobService.getJobs(params);
      if (res.success) {
        setJobs(res.data);
        setTotalPages(res.pages);
        setTotalJobs(res.total);
      }
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [search, location, category, jobType, sortBy, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Sync saved jobs and applied jobs if student is authenticated
  useEffect(() => {
    if (isAuthenticated && role === 'student') {
      studentService.getSavedJobs()
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            const ids = new Set(res.data.map(item => item.job ? item.job.id : item.id));
            setSavedJobIds(ids);
          }
        })
        .catch(err => console.error('Failed to fetch saved jobs:', err));

      studentService.getApplications()
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            const ids = new Set(res.data.map(item => item.job_id || item.job?.id));
            setAppliedJobIds(ids);
          }
        })
        .catch(err => console.error('Failed to fetch applications:', err));
    } else {
      setSavedJobIds(new Set());
      setAppliedJobIds(new Set());
    }
  }, [isAuthenticated, role]);

  // Helper to update state & sync URL parameters
  const updateFilter = (key, value) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('all');
    setJobType('all');
    setSortBy('latest');
    setPage(1);
    setSearchParams({});
  };

  const handleSaveJob = async (jobId) => {
    if (!isAuthenticated) {
      addToast('Please login as a student to bookmark jobs', 'error');
      navigate('/login');
      return;
    }

    try {
      const res = await jobService.toggleSaveJob(jobId);
      if (res.success) {
        setSavedJobIds(prev => {
          const next = new Set(prev);
          if (res.saved) next.add(jobId);
          else next.delete(jobId);
          return next;
        });
        addToast(res.message, 'success');
      }
    } catch (err) {
      addToast(err.customMessage || 'Failed to save job', 'error');
    }
  };

  const handleApplySubmit = async (jobId, applyPayload) => {
    if (!isAuthenticated) {
      addToast('Please login as a student to apply for jobs', 'error');
      navigate('/login');
      return;
    }
    if (role !== 'student') {
      addToast('Only student accounts can apply for jobs', 'error');
      return;
    }

    setApplying(true);
    try {
      const res = await jobService.applyJob(jobId, applyPayload);
      if (res.success) {
        addToast(res.message, 'success');
        setAppliedJobIds(prev => new Set(prev).add(jobId));
        setSelectedJob(null);
      }
    } catch (err) {
      const msg = err.customMessage || 'Failed to submit application';
      if (msg.toLowerCase().includes('already')) {
        setAppliedJobIds(prev => new Set(prev).add(jobId));
        addToast(msg, 'info');
        setSelectedJob(null);
      } else {
        addToast(msg, 'error');
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        
        {/* Page Header */}
        <div className="mb-4">
          <h2 className="fw-extrabold text-body mb-1">Explore Part-Time Jobs</h2>
          <p className="text-body-secondary small mb-0">Browse {totalJobs} active student job positions in Tamil Nadu</p>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-4 mb-4">
          <div className="row g-3 align-items-center">
            
            {/* Search Input */}
            <div className="col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted"><FaSearch /></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0 bg-transparent text-body"
                  placeholder="Job title, skill, or keyword..."
                  value={search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                />
              </div>
            </div>

            {/* Location Input */}
            <div className="col-lg-3 col-sm-6">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted"><FaMapMarkerAlt /></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0 bg-transparent text-body"
                  placeholder="Location (Salem, Erode...)"
                  value={location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="col-lg-2 col-sm-6">
              <select 
                className="form-select bg-transparent text-body"
                value={category}
                onChange={(e) => updateFilter('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Job Type Dropdown */}
            <div className="col-lg-2 col-sm-6">
              <select 
                className="form-select bg-transparent text-body"
                value={jobType}
                onChange={(e) => updateFilter('job_type', e.target.value)}
              >
                <option value="all">All Job Types</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Weekend">Weekend</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="col-lg-1 col-sm-6">
              <button 
                onClick={handleResetFilters} 
                className="btn btn-outline-custom w-100 p-2 d-flex align-items-center justify-content-center"
                title="Reset Filters"
              >
                <FaRedo />
              </button>
            </div>

          </div>

          {/* Sort bar & active stats */}
          <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 mt-3 border-top border-secondary border-opacity-25 gap-2">
            <div className="small text-body-secondary">
              Showing <strong className="text-body">{jobs.length}</strong> of <strong className="text-body">{totalJobs}</strong> jobs
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted d-flex align-items-center gap-1"><FaSortAmountDown /> Sort:</span>
              <select 
                className="form-select form-select-sm bg-transparent text-body border-secondary border-opacity-25"
                style={{ width: '150px' }}
                value={sortBy}
                onChange={(e) => updateFilter('sort_by', e.target.value)}
              >
                <option value="latest">Latest Posted</option>
                <option value="salary">Highest Salary</option>
                <option value="title">Job Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="row g-4">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="col-md-6 col-lg-4">
                <JobCardSkeleton />
              </div>
            ))
          ) : jobs.length > 0 ? (
            jobs.map(job => (
              <div key={job.id} className="col-md-6 col-lg-4">
                <JobCard 
                  job={job}
                  onViewDetails={(j) => setSelectedJob(j)}
                  onApply={(j) => setSelectedJob(j)}
                  onSave={handleSaveJob}
                  isSaved={savedJobIds.has(job.id)}
                  isApplied={appliedJobIds.has(job.id)}
                />
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <div className="glass-card p-5 max-w-md mx-auto">
                <FaInbox className="fs-1 text-muted mb-3" />
                <h5 className="fw-bold mb-2">No Matching Jobs Found</h5>
                <p className="text-body-secondary small mb-3">Try adjusting your search terms, category, or location filter.</p>
                <button onClick={handleResetFilters} className="btn btn-primary-custom btn-sm">
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
            <button 
              className="btn btn-outline-custom btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="small fw-semibold px-3 text-body-secondary">
              Page {page} of {totalPages}
            </span>
            <button 
              className="btn btn-outline-custom btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}

      </div>

      {/* Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplySubmit={handleApplySubmit}
          applying={applying}
          alreadyApplied={appliedJobIds.has(selectedJob.id)}
        />
      )}
    </div>
  );
};

export default JobSearch;
