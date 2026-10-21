import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { 
  FaClipboardList, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUser, 
  FaBuilding, 
  FaFileAlt,
  FaDownload,
  FaFileCsv,
  FaPhone,
  FaEnvelope,
  FaGraduationCap
} from 'react-icons/fa';

const AdminApplications = ({ addToast }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await adminService.getApplications();
      if (res.success) setApplications(res.data);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await adminService.updateAppStatus(appId, newStatus);
      if (res.success) {
        addToast(`Application status updated to ${newStatus} & email sent to student!`, 'success');
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      addToast(err.customMessage || 'Failed to update application status', 'error');
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) {
      addToast('No application records to export', 'error');
      return;
    }

    const headers = ['Application ID,Student Name,Mobile Number,Email,College,Job Title,Company,Salary,Applied Date,Status,Cover Note'];
    const rows = applications.map(app => [
      app.id,
      `"${app.student?.full_name || ''}"`,
      `"${app.student?.phone || ''}"`,
      `"${app.student?.email || ''}"`,
      `"${app.student?.college || ''}"`,
      `"${app.job?.title || ''}"`,
      `"${app.job?.company_name || ''}"`,
      `"${app.job?.salary || ''}"`,
      `"${app.applied_date || ''}"`,
      `"${app.status || ''}"`,
      `"${(app.cover_note || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_applications_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Exported applications report to CSV!', 'success');
  };

  const filteredApps = filterStatus === 'all' 
    ? applications 
    : applications.filter(a => a.status === filterStatus);

  return (
    <div className="py-5">
      <div className="container">
        <div className="row g-4">
          
          <div className="col-lg-3">
            <AdminSidebar />
          </div>

          <div className="col-lg-9">
            
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
              <div>
                <h2 className="fw-extrabold text-body mb-1">Application Submissions</h2>
                <p className="text-body-secondary small mb-0">Review student applications, update status & export CSV reports.</p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button onClick={handleExportCSV} className="btn btn-outline-success btn-sm d-flex align-items-center gap-1.5 fw-bold">
                  <FaFileCsv className="fs-5" /> Export CSV
                </button>
              </div>
            </div>

            {/* Status filter tabs */}
            <div className="btn-group mb-4">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-outline-custom'}`}
              >
                All ({applications.length})
              </button>
              <button 
                onClick={() => setFilterStatus('Pending')}
                className={`btn btn-sm ${filterStatus === 'Pending' ? 'btn-warning text-dark fw-bold' : 'btn-outline-custom'}`}
              >
                Pending ({applications.filter(a => a.status === 'Pending').length})
              </button>
              <button 
                onClick={() => setFilterStatus('Accepted')}
                className={`btn btn-sm ${filterStatus === 'Accepted' ? 'btn-success' : 'btn-outline-custom'}`}
              >
                Accepted ({applications.filter(a => a.status === 'Accepted').length})
              </button>
              <button 
                onClick={() => setFilterStatus('Rejected')}
                className={`btn btn-sm ${filterStatus === 'Rejected' ? 'btn-danger' : 'btn-outline-custom'}`}
              >
                Rejected ({applications.filter(a => a.status === 'Rejected').length})
              </button>
            </div>

            {loading ? (
              <div className="glass-card p-5 text-center text-muted">Loading application list...</div>
            ) : filteredApps.length > 0 ? (
              <div className="glass-card overflow-hidden">
                <div className="table-responsive">
                  <table className="table align-middle mb-0 text-body">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Student Info</th>
                        <th>Mobile Number</th>
                        <th>Applied Position</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Cover Note</th>
                        <th className="pe-4 text-end">Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApps.map(app => (
                        <tr key={app.id} className="border-bottom border-secondary border-opacity-25">
                          <td className="ps-4 py-3">
                            <div className="fw-bold text-body mb-0">{app.student?.full_name || 'Student'}</div>
                            <div className="text-muted extra-small d-flex align-items-center gap-1">
                              <FaEnvelope className="text-primary extra-small" /> {app.student?.email}
                            </div>
                            <div className="text-muted extra-small d-flex align-items-center gap-1">
                              <FaGraduationCap className="text-secondary extra-small" /> {app.student?.college}
                            </div>
                          </td>

                          <td>
                            {app.student?.phone ? (
                              <a 
                                href={`tel:${app.student.phone}`} 
                                className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 text-decoration-none fw-bold d-inline-flex align-items-center gap-1.5"
                                title="Click to call student"
                              >
                                <FaPhone className="extra-small" /> {app.student.phone}
                              </a>
                            ) : (
                              <span className="text-muted extra-small">No phone</span>
                            )}
                          </td>

                          <td className="small">
                            <div className="fw-bold text-primary">{app.job?.title}</div>
                            <div className="text-muted extra-small"><FaBuilding /> {app.job?.company_name}</div>
                          </td>

                          <td className="small text-muted">{app.applied_date}</td>

                          <td>
                            <span className={`badge-status ${app.status === 'Accepted' ? 'badge-accepted' : app.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                              {app.status}
                            </span>
                          </td>

                          <td className="small text-muted" style={{ maxWidth: '180px' }}>
                            {app.cover_note ? (
                              <span title={app.cover_note} className="text-truncate d-block">
                                <FaFileAlt className="text-primary me-1" /> {app.cover_note}
                              </span>
                            ) : (
                              <em>No note</em>
                            )}
                          </td>

                          <td className="pe-4 text-end">
                            <div className="d-flex justify-content-end gap-1">
                              <button 
                                onClick={() => handleStatusChange(app.id, 'Accepted')}
                                className="btn btn-sm btn-success px-2 py-1 extra-small fw-semibold d-flex align-items-center gap-1"
                                disabled={app.status === 'Accepted'}
                              >
                                <FaCheck /> Accept
                              </button>
                              <button 
                                onClick={() => handleStatusChange(app.id, 'Rejected')}
                                className="btn btn-sm btn-outline-danger px-2 py-1 extra-small fw-semibold d-flex align-items-center gap-1"
                                disabled={app.status === 'Rejected'}
                              >
                                <FaTimes /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="glass-card p-5 text-center text-muted">
                No applications matching filter criteria.
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminApplications;
