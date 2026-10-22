import React, { useState, useEffect } from 'react';
import { adminService, uploadService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaMoneyBillWave,
  FaPhone,
  FaTag,
  FaCloudUploadAlt
} from 'react-icons/fa';

const AdminJobs = ({ addToast }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    owner_phone: '',
    location: '',
    job_type: 'Part-Time',
    salary: '',
    category: 'Bakery',
    image_url: '',
    description: '',
    requirements: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await adminService.getJobs();
      if (res.success) setJobs(res.data);
    } catch (err) {
      console.error('Error fetching admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        company_name: job.company_name,
        owner_phone: job.owner_phone || '',
        location: job.location,
        job_type: job.job_type,
        salary: job.salary,
        category: job.category,
        image_url: job.image_url || '',
        description: job.description,
        requirements: job.requirements,
        status: job.status
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        company_name: '',
        owner_phone: '',
        location: '',
        job_type: 'Part-Time',
        salary: '',
        category: 'Bakery',
        image_url: '',
        description: '',
        requirements: '',
        status: 'Active'
      });
    }
    setShowModal(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadService.uploadImage(file);
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, image_url: res.url }));
        addToast('Photo uploaded successfully!', 'success');
      }
    } catch (err) {
      console.error('File upload error:', err);
      addToast(err.customMessage || 'Photo upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingJob) {
        const res = await adminService.updateJob(editingJob.id, formData);
        if (res.success) addToast('Job updated successfully!', 'success');
      } else {
        const res = await adminService.createJob(formData);
        if (res.success) addToast('New job posted successfully!', 'success');
      }
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      addToast(err.customMessage || 'Failed to save job posting', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
    try {
      const res = await adminService.updateJob(job.id, { ...job, status: newStatus });
      if (res.success) {
        addToast(`Job status updated to ${newStatus}`, 'success');
        fetchJobs();
      }
    } catch (err) {
      addToast('Failed to update job status', 'error');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await adminService.deleteJob(jobId);
      if (res.success) {
        addToast('Job posting deleted', 'success');
        fetchJobs();
      }
    } catch (err) {
      addToast('Failed to delete job', 'error');
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="row g-4">
          
          <div className="col-lg-3">
            <AdminSidebar />
          </div>

          <div className="col-lg-9">
            
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-2">
              <div>
                <h2 className="fw-extrabold text-body mb-1">Job Postings Management</h2>
                <p className="text-body-secondary small mb-0">Create, edit, toggle active status, and remove job listings.</p>
              </div>

              <button onClick={() => handleOpenModal()} className="btn btn-primary-custom btn-sm">
                <FaPlus /> Post New Job
              </button>
            </div>

            {loading ? (
              <div className="glass-card p-5 text-center text-muted">Loading job postings...</div>
            ) : (
              <div className="glass-card overflow-hidden">
                <div className="table-responsive">
                  <table className="table align-middle mb-0 text-body">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Title & Company</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Salary</th>
                        <th>Status</th>
                        <th className="pe-4 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(j => (
                        <tr key={j.id} className="border-bottom border-secondary border-opacity-25">
                          <td className="ps-4 py-3">
                            <div className="fw-bold text-body mb-0">{j.title}</div>
                            <div className="text-muted extra-small d-flex align-items-center gap-2">
                              <span><FaBuilding className="text-primary" /> {j.company_name}</span>
                              <span>•</span>
                              <span><FaMapMarkerAlt className="text-danger" /> {j.location}</span>
                            </div>
                          </td>

                          <td>
                            <span className="badge bg-body-tertiary text-body border border-secondary border-opacity-25 rounded-pill px-2.5 py-1 extra-small">
                              {j.category}
                            </span>
                          </td>

                          <td className="small">{j.job_type}</td>
                          <td className="small fw-bold text-success">{j.salary}</td>

                          <td>
                            <button 
                              onClick={() => handleToggleStatus(j)}
                              className={`badge border-0 rounded-pill px-2.5 py-1 extra-small fw-bold cursor-pointer ${j.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-muted'}`}
                            >
                              {j.status} (Click to toggle)
                            </button>
                          </td>

                          <td className="pe-4 text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button 
                                onClick={() => handleOpenModal(j)}
                                className="btn btn-sm btn-outline-custom p-1.5"
                                title="Edit Job"
                              >
                                <FaEdit className="text-primary" />
                              </button>
                              <button 
                                onClick={() => handleDelete(j.id)}
                                className="btn btn-sm btn-outline-custom p-1.5"
                                title="Delete Job"
                              >
                                <FaTrash className="text-danger" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Create / Edit Job Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-card border-0 shadow-lg">
              
              <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3">
                <h5 className="modal-title fw-bold text-body">
                  {editingJob ? 'Edit Job Posting' : 'Post New Part-Time Job'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 max-vh-75 overflow-y-auto">
                  
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-body">Job Title *</label>
                      <input 
                        type="text" 
                        className="form-input-custom"
                        placeholder="Bakery Sales Assistant"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-body">Company Name *</label>
                      <input 
                        type="text" 
                        className="form-input-custom"
                        placeholder="Sri Krishna Bakery"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-body">Job Owner Contact Number</label>
                      <input
                        type="tel"
                        className="form-input-custom"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.owner_phone}
                        onChange={(e) => setFormData({ ...formData, owner_phone: e.target.value })}
                        maxLength={30}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-body">Location *</label>
                      <input 
                        type="text" 
                        className="form-input-custom"
                        placeholder="Salem, Tamil Nadu"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-body">Salary / Stipend *</label>
                      <input 
                        type="text" 
                        className="form-input-custom"
                        placeholder="₹12,000 / month"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-body">Category *</label>
                      <select 
                        className="form-select bg-transparent text-body"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Bakery">Bakery</option>
                        <option value="Medical">Medical</option>
                        <option value="Grocery Store">Grocery Store</option>
                        <option value="Hotel & Restaurant">Hotel & Restaurant</option>
                        <option value="Tea & Cafe">Tea & Cafe</option>
                        <option value="Supermarket">Supermarket</option>
                        <option value="Tech & Data Entry">Tech & Data Entry</option>
                        <option value="Tutoring & Education">Tutoring & Education</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-body">Job Type *</label>
                      <select 
                        className="form-select bg-transparent text-body"
                        value={formData.job_type}
                        onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                      >
                        <option value="Part-Time">Part-Time</option>
                        <option value="Internship">Internship</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Weekend">Weekend</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-body d-flex align-items-center justify-content-between">
                      <span><FaCloudUploadAlt className="text-primary me-1" /> Job Photo Upload (Cloudinary)</span>
                      {uploadingImage && <span className="text-primary extra-small">Uploading photo...</span>}
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="form-control bg-transparent text-body border-secondary border-opacity-25"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                    />
                    {formData.image_url ? (
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <img 
                          src={formData.image_url} 
                          alt="Uploaded Preview" 
                          className="rounded border border-secondary border-opacity-25"
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }} 
                        />
                        <div className="extra-small text-success fw-semibold text-break">
                          ✓ Photo Uploaded: {formData.image_url.slice(0, 45)}...
                        </div>
                      </div>
                    ) : (
                      <span className="extra-small text-muted d-block mt-1">Select a photo from your device to upload directly to Cloudinary.</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-body">Job Description *</label>
                    <textarea 
                      className="form-input-custom"
                      rows="3"
                      placeholder="Detail the daily responsibilities..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-body">Requirements & Skills *</label>
                    <textarea 
                      className="form-input-custom"
                      rows="2"
                      placeholder="Good communication, basic math, student status..."
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-body">Status</label>
                    <select 
                      className="form-select bg-transparent text-body"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                </div>

                <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3">
                  <button type="button" className="btn btn-outline-custom btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom btn-sm" disabled={saving}>
                    {saving ? 'Saving...' : editingJob ? 'Update Job' : 'Post Job'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminJobs;
