import React, { useState, useEffect } from 'react';
import { studentService } from '../services/api';
import { 
  FaClipboardList, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaFileAlt,
  FaPrint,
  FaTimes,
  FaShieldAlt
} from 'react-icons/fa';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedAppModal, setSelectedAppModal] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await studentService.getApplications();
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = filterStatus === 'All' 
    ? applications 
    : applications.filter(a => a.status === filterStatus);

  const pendingCount = applications.filter(a => a.status === 'Pending').length;
  const acceptedCount = applications.filter(a => a.status === 'Accepted').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="py-5">
      <div className="container">
        
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <h2 className="fw-extrabold text-body mb-1">My Applications</h2>
            <p className="text-body-secondary small mb-0">Track the real-time status of your submitted part-time job applications.</p>
          </div>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 fw-bold">
            {applications.length} Total Submissions
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button 
            onClick={() => setFilterStatus('All')}
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-semibold ${filterStatus === 'All' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
          >
            All ({applications.length})
          </button>
          <button 
            onClick={() => setFilterStatus('Pending')}
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-semibold ${filterStatus === 'Pending' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
          >
            <FaClock className="me-1" /> Pending ({pendingCount})
          </button>
          <button 
            onClick={() => setFilterStatus('Accepted')}
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-semibold ${filterStatus === 'Accepted' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
          >
            <FaCheckCircle className="me-1 text-success" /> Accepted ({acceptedCount})
          </button>
          <button 
            onClick={() => setFilterStatus('Rejected')}
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-semibold ${filterStatus === 'Rejected' ? 'btn-primary-custom' : 'btn-outline-custom'}`}
          >
            <FaTimesCircle className="me-1 text-danger" /> Rejected ({rejectedCount})
          </button>
        </div>

        {loading ? (
          <div className="glass-card p-5 text-center text-muted">
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <p className="mb-0">Loading application history...</p>
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="glass-card overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0 text-body">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Job Title & Company</th>
                    <th>Category</th>
                    <th>Salary</th>
                    <th>Applied Date</th>
                    <th>Status Badge</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map(app => (
                    <tr key={app.id} className="border-bottom border-secondary border-opacity-25">
                      <td className="ps-4 py-3">
                        <div className="fw-bold text-body mb-0">{app.job?.title || 'Unknown Job'}</div>
                        <div className="text-muted extra-small d-flex align-items-center gap-2">
                          <span><FaBuilding className="text-primary" /> {app.job?.company_name}</span>
                          <span>•</span>
                          <span><FaMapMarkerAlt className="text-danger" /> {app.job?.location}</span>
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-body-tertiary text-body border border-secondary border-opacity-25 rounded-pill px-2.5 py-1 extra-small">
                          {app.job?.category}
                        </span>
                      </td>

                      <td className="fw-semibold text-success small">
                        {app.job?.salary}
                      </td>

                      <td className="small text-body-secondary">
                        {app.applied_date}
                      </td>

                      <td>
                        <span className={`badge-status ${app.status === 'Accepted' ? 'badge-accepted' : app.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                          {app.status === 'Accepted' && <FaCheckCircle />}
                          {app.status === 'Rejected' && <FaTimesCircle />}
                          {app.status === 'Pending' && <FaClock />}
                          {app.status}
                        </span>
                      </td>

                      <td className="pe-4">
                        <button 
                          onClick={() => setSelectedAppModal(app)} 
                          className="btn btn-sm btn-outline-custom py-1 px-2.5 extra-small fw-bold"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card p-5 text-center">
            <FaClipboardList className="fs-1 text-muted mb-3" />
            <h5 className="fw-bold mb-2">No Applications Found</h5>
            <p className="text-body-secondary small mb-0">You have no job applications matching status "{filterStatus}".</p>
          </div>
        )}

      </div>

      {/* Printable Application Receipt Modal */}
      {selectedAppModal && (
        <div className="modal show d-block tab-modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setSelectedAppModal(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content p-4">
              
              <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-secondary border-opacity-25">
                <div className="d-flex align-items-center gap-2">
                  <FaShieldAlt className="fs-4 text-primary" />
                  <div>
                    <h5 className="fw-bold text-body mb-0">Official Application Slip</h5>
                    <span className="extra-small text-muted">Reference #: APP-{selectedAppModal.id}-2026</span>
                  </div>
                </div>
                <button onClick={() => setSelectedAppModal(null)} className="btn-close"></button>
              </div>

              <div className="p-3 bg-body-tertiary rounded-3 mb-3 small">
                <div className="row g-2">
                  <div className="col-6">
                    <span className="text-muted d-block extra-small">Applicant Name:</span>
                    <strong className="text-body">{selectedAppModal.student?.full_name}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block extra-small">College:</span>
                    <strong className="text-body">{selectedAppModal.student?.college || 'GCE Salem'}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block extra-small">Job Title:</span>
                    <strong className="text-body">{selectedAppModal.job?.title}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block extra-small">Employer:</span>
                    <strong className="text-body">{selectedAppModal.job?.company_name}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block extra-small">Stipend:</span>
                    <strong className="text-success">{selectedAppModal.job?.salary}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block extra-small">Application Status:</span>
                    <span className={`badge-status ${selectedAppModal.status === 'Accepted' ? 'badge-accepted' : selectedAppModal.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                      {selectedAppModal.status}
                    </span>
                  </div>
                </div>

                {selectedAppModal.cover_note && (
                  <div className="mt-3 pt-2 border-top border-secondary border-opacity-25">
                    <span className="text-muted d-block extra-small">Cover Note Attached:</span>
                    <p className="mb-0 fst-italic text-body">{selectedAppModal.cover_note}</p>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center justify-content-between pt-2">
                <span className="extra-small text-muted">Smart Student Job Management System</span>
                <button onClick={handlePrintSlip} className="btn btn-primary-custom btn-sm">
                  <FaPrint className="me-1" /> Print Slip
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyApplications;
