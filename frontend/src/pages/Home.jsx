import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService, studentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import CategoryCard from '../components/CategoryCard';
import JobDetailModal from '../components/JobDetailModal';
import { JobCardSkeleton } from '../components/Skeleton';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaThLarge, 
  FaShieldAlt, 
  FaClock, 
  FaGraduationCap,
  FaArrowRight,
  FaCheckCircle,
  FaUniversity,
  FaChevronDown,
  FaChevronUp,
  FaBolt,
  FaQuestionCircle,
  FaMoneyBillWave,
  FaUsers,
  FaBuilding,
  FaStar
} from 'react-icons/fa';

const Home = ({ addToast }) => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [activeTabCategory, setActiveTabCategory] = useState('All');
  
  const [categories, setCategories] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, jobRes] = await Promise.all([
          jobService.getCategories(),
          jobService.getJobs({ page: 1, per_page: 9 })
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (jobRes.success) setFeaturedJobs(jobRes.data);
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Fetch saved and applied jobs if student is authenticated
  useEffect(() => {
    if (isAuthenticated && role === 'student') {
      studentService.getSavedJobs()
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            const ids = new Set(res.data.map(item => item.job ? item.job.id : item.id));
            setSavedJobIds(ids);
          }
        })
        .catch(err => console.error('Failed to load saved jobs:', err));

      studentService.getApplications()
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            const ids = new Set(res.data.map(item => item.job_id || item.job?.id));
            setAppliedJobIds(ids);
          }
        })
        .catch(err => console.error('Failed to load applications:', err));
    } else {
      setSavedJobIds(new Set());
      setAppliedJobIds(new Set());
    }
  }, [isAuthenticated, role]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTitle) params.set('search', searchTitle);
    if (searchLocation) params.set('location', searchLocation);
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/jobs?${params.toString()}`);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/jobs?category=${encodeURIComponent(categoryName)}`);
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

  const displayedJobs = activeTabCategory === 'All' 
    ? featuredJobs 
    : featuredJobs.filter(j => j.category === activeTabCategory);

  const faqs = [
    {
      q: "Is Smart Student Job Management System free for college students?",
      a: "Yes! Creating an account, searching for part-time jobs, and submitting applications is 100% free for all college students."
    },
    {
      q: "How do part-time work shifts fit around my college timetable?",
      a: "All employers on our portal offer flexible student shifts (e.g., 4 to 6 hours daily, evening shifts, or weekend shifts) designed not to conflict with morning lectures."
    },
    {
      q: "How does 6-Digit Email OTP protection work?",
      a: "Every registration and login requires an instant 6-digit OTP code sent directly to your registered email inbox. This ensures your student account and application data remain 100% secure."
    },
    {
      q: "When and how do I receive my part-time stipend/salary?",
      a: "Salaries are paid directly by verified local employers on a weekly or monthly basis as stated in the job listing (e.g. ₹200/hr, ₹6,000/month)."
    }
  ];

  return (
    <div className="landing-page overflow-hidden">
      
      {/* 1. HERO SECTION WITH AMBIENT ORBS & SLEEK LIVE JOB PREVIEW */}
      <section className="py-5 position-relative overflow-hidden">
        {/* Dynamic Background Glow Orbs */}
        <div className="ambient-glow-orb top-0 start-0 translate-middle-y"></div>
        <div className="ambient-glow-orb-secondary bottom-0 end-0"></div>

        <div className="container py-lg-5 position-relative z-1">
          <div className="row align-items-center g-5">
            
            {/* Left Content Column */}
            <div className="col-lg-7 animate-fade-in-up">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3.5 py-2 fw-bold small mb-3 d-inline-flex align-items-center gap-2 shadow-sm">
                <FaGraduationCap className="fs-6 text-primary" /> #1 College Student Job Network in Salem
              </span>

              <h1 className="display-4 fw-extrabold text-body tracking-tight mb-3">
                 <span className="text-gradient-primary">Smart Student Part-Time Jobs Management</span> 
              </h1>


              {/* Unique Gradient Border Hero Search Box */}
              <div className="gradient-border-card mb-4">
                <div className="bg-body rounded-4 p-3 p-md-4">
                  <form onSubmit={handleHeroSearch} className="row g-2">
                    <div className="col-md-4">
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0 text-muted"><FaSearch /></span>
                        <input 
                          type="text" 
                          className="form-control border-start-0 ps-0 bg-transparent text-body"
                          placeholder="Job title, skill..."
                          value={searchTitle}
                          onChange={(e) => setSearchTitle(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0 text-muted"><FaMapMarkerAlt /></span>
                        <input 
                          type="text" 
                          className="form-control border-start-0 ps-0 bg-transparent text-body"
                          placeholder="Salem, Erode..."
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="input-group">
                        <span className="input-group-text bg-transparent border-end-0 text-muted"><FaThLarge /></span>
                        <select 
                          className="form-select border-start-0 ps-0 bg-transparent text-body"
                          value={searchCategory}
                          onChange={(e) => setSearchCategory(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-2">
                      <button type="submit" className="btn btn-primary-custom w-100 h-100 justify-content-center">
                        Search
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Feature Pill Badges */}
              <div className="d-flex flex-wrap align-items-center gap-3 text-body-secondary small">
                <span className="badge bg-body-tertiary text-body border border-secondary border-opacity-25 rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5">
                  <FaBolt className="text-warning" /> 5-Min Quick Apply
                </span>
                <span className="badge bg-body-tertiary text-body border border-secondary border-opacity-25 rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5">
                  <FaShieldAlt className="text-success" /> 100% Verified Employers
                </span>
                <span className="badge bg-body-tertiary text-body border border-secondary border-opacity-25 rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5">
                  <FaClock className="text-primary" /> Flexible Shift Hours
                </span>
              </div>

            </div>

            {/* Right Interactive Showcase */}
            <div className="col-lg-5 d-none d-lg-block">
              <div className="position-relative py-3">
                
                {/* Main Hero Glass Job Showcase Card */}
                <div className="glass-card shadow-lg border-primary border-opacity-25 float-animation p-3">
                  <div className="job-img-wrapper rounded-3 mb-3" style={{ height: '185px' }}>
                    <img 
                      src="https://content.jdmagicbox.com/comp/salem/y9/0427px427.x427.211226080350.i6y9/catalogue/coffee-time-sweets-bakery-edappadi-salem-tea-retailers-s4ol3rulg6.jpg?w=3840&q=75" 
                      alt="Tea Shop Staff"
                    />
                    <div className="job-img-overlay"></div>
                    <div className="position-absolute top-0 start-0 m-3 z-1">
                      <span className="badge bg-dark bg-opacity-75 text-white backdrop-blur border border-white border-opacity-25 rounded-pill px-3 py-1 extra-small fw-bold">
                        ☕ Tea Shop • Salem
                      </span>
                    </div>
                  </div>

                  <div className="px-2 pb-1">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <h6 className="fw-extrabold text-body mb-0">Tea Shop Staff</h6>
                      <span className="pulse-indicator" title="Active Hiring"></span>
                    </div>
                    
                    <p className="text-body-secondary extra-small mb-3">Salem Tea House • Evening 5-Hour Shift</p>
                    
                    <div className="d-flex align-items-center justify-content-between pt-2 border-top border-secondary border-opacity-25">
                      <span className="badge badge-salary-glow px-3 py-1.5 rounded-3 small fw-bold">
                        ₹12,000 / month
                      </span>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 extra-small fw-semibold">
                        Part-Time
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Micro-Badge */}
                <div className="glass-card px-3 py-2.5 shadow-lg position-absolute bottom-0 start-0 translate-middle-y ms-n3 border-success border-opacity-25 float-animation-delayed" style={{ zIndex: 3 }}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-success text-white rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px' }}>
                      <FaCheckCircle className="extra-small" />
                    </div>
                    <span className="extra-small fw-bold text-body">100% Student Verified</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE STATISTICS COUNTER BAR */}
      {/* <section className="py-4 bg-body-tertiary border-y border-secondary border-opacity-25">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                <FaUsers className="fs-4 text-primary" />
                <span className="fs-3 fw-extrabold text-body">500+</span>
              </div>
              <div className="text-body-secondary small fw-semibold">Active College Students</div>
            </div>

            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                <FaBuilding className="fs-4 text-success" />
                <span className="fs-3 fw-extrabold text-body">120+</span>
              </div>
              <div className="text-body-secondary small fw-semibold">Verified Employers</div>
            </div>

            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                <FaMoneyBillWave className="fs-4 text-warning" />
                <span className="fs-3 fw-extrabold text-body">₹12k+</span>
              </div>
              <div className="text-body-secondary small fw-semibold">Average Monthly Stipend</div>
            </div>

            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                <FaStar className="fs-4 text-info" />
                <span className="fs-3 fw-extrabold text-body">98%</span>
              </div>
              <div className="text-body-secondary small fw-semibold">Application Response Rate</div>
            </div>
          </div>
        </div>
      </section> */}

      {/* 3. BROWSE JOB CATEGORIES */}
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <h2 className="fw-extrabold text-body mb-2">Explore Job Categories</h2>
            <p className="text-body-secondary">Choose from diverse part-time roles suited to your study timetable.</p>
          </div>

          <div className="row g-4">
            {categories.slice(0, 8).map(cat => (
              <div key={cat.id} className="col-6 col-md-3">
                <CategoryCard category={cat} onClick={handleCategoryClick} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED JOBS WITH HOME INTERACTIVE CATEGORY TABS */}
      <section className="py-5 bg-body-tertiary">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
            <div>
              <h2 className="fw-extrabold text-body mb-1">Featured Part-Time Jobs</h2>
            </div>
            <button onClick={() => navigate('/jobs')} className="btn btn-outline-custom">
              View All Jobs <FaArrowRight className="ms-1 extra-small" />
            </button>
          </div>

          {/* Interactive Home Category Tabs */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {['All', 'Bakery', 'Medical', 'Hotel & Restaurant', 'Tea & Cafe'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTabCategory(cat)}
                className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-semibold ${activeTabCategory === cat ? 'btn-primary-custom' : 'btn-outline-custom'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Jobs Grid */}
          <div className="row g-4">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="col-md-6 col-lg-4">
                  <JobCardSkeleton />
                </div>
              ))
            ) : displayedJobs.length > 0 ? (
              displayedJobs.map(job => (
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
              <div className="col-12 text-center py-5 text-muted">
                No active jobs in this category right now.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. 3-STEP STUDENT HIRING FLOW */}
      {/* <section className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-extrabold text-body mb-2">How It Works</h2>
            <p className="text-body-secondary">Get hired in 3 simple steps.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="glass-card p-4 text-center h-100">
                <div className="bg-primary text-white rounded-circle p-3 d-inline-flex mb-3 fw-bold fs-4 shadow-sm" style={{ width: '56px', height: '56px' }}>
                  1
                </div>
                <h5 className="fw-bold mb-2">Register & Verify OTP</h5>
                <p className="text-body-secondary small mb-0">
                  Create your free student account with college & department details and verify using 6-digit OTP sent to your email.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="glass-card p-4 text-center h-100">
                <div className="bg-primary text-white rounded-circle p-3 d-inline-flex mb-3 fw-bold fs-4 shadow-sm" style={{ width: '56px', height: '56px' }}>
                  2
                </div>
                <h5 className="fw-bold mb-2">Search & Apply Jobs</h5>
                <p className="text-body-secondary small mb-0">
                  Filter part-time positions by location, salary, or category and submit application with a single click.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="glass-card p-4 text-center h-100">
                <div className="bg-primary text-white rounded-circle p-3 d-inline-flex mb-3 fw-bold fs-4 shadow-sm" style={{ width: '56px', height: '56px' }}>
                  3
                </div>
                <h5 className="fw-bold mb-2">Track & Get Hired</h5>
                <p className="text-body-secondary small mb-0">
                  Monitor your application status on your dashboard and start earning part-time income right away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* 6. COLLEGE PARTNER TRUST BANNER */}
      {/* <section className="py-4 border-y border-secondary border-opacity-25 bg-body-tertiary">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-4 text-center text-md-start">
            <span className="text-muted extra-small uppercase fw-extrabold letter-spacing-1 mx-auto mx-md-0">
              TRUSTED BY STUDENTS FROM TOP TAMIL NADU COLLEGES
            </span>
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 text-body-secondary fw-semibold small mx-auto mx-md-0 opacity-75">
              <span className="d-flex align-items-center gap-1.5"><FaUniversity className="text-primary" /> GCE Salem</span>
              <span className="d-flex align-items-center gap-1.5"><FaUniversity className="text-primary" /> KSR Institutions</span>
              <span className="d-flex align-items-center gap-1.5"><FaUniversity className="text-primary" /> Govt Arts College</span>
              <span className="d-flex align-items-center gap-1.5"><FaUniversity className="text-primary" /> Anna University Affiliated</span>
            </div>
          </div>
        </div>
      </section> */}

      {/* 7. INTERACTIVE FAQ ACCORDION SECTION */}
      {/* <section className="py-5">
        <div className="container py-4 max-w-3xl">
          <div className="text-center mb-5">
            <h2 className="fw-extrabold text-body mb-2">Frequently Asked Questions</h2>
            <p className="text-body-secondary">Everything you need to know about student part-time jobs.</p>
          </div>

          <div className="d-flex flex-column gap-3">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="glass-card p-4 cursor-pointer"
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <h6 className="fw-bold mb-0 text-body d-flex align-items-center gap-2">
                    <FaQuestionCircle className="text-primary flex-shrink-0" /> {faq.q}
                  </h6>
                  {openFaq === index ? <FaChevronUp className="text-primary" /> : <FaChevronDown className="text-muted" />}
                </div>
                {openFaq === index && (
                  <p className="text-body-secondary small mt-3 mb-0 pt-3 border-top border-secondary border-opacity-25 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Modal View */}
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

export default Home;
