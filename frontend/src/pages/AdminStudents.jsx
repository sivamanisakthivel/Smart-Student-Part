import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { FaUserGraduate, FaSearch, FaTrash, FaEnvelope, FaPhone, FaUniversity, FaGraduationCap, FaCode } from 'react-icons/fa';

const AdminStudents = ({ addToast }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      const res = await adminService.getStudents({ search });
      if (res.success) setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student account?')) return;

    try {
      const res = await adminService.deleteStudent(studentId);
      if (res.success) {
        addToast(res.message, 'success');
        fetchStudents();
      }
    } catch (err) {
      addToast('Failed to remove student', 'error');
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
            
            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3">
              <div>
                <h2 className="fw-extrabold text-body mb-1">Student Directory</h2>
                <p className="text-body-secondary small mb-0">View registered student profiles and manage access.</p>
              </div>

              {/* Search bar */}
              <div className="input-group max-w-xs">
                <span className="input-group-text bg-transparent border-end-0 text-muted"><FaSearch /></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 ps-0 bg-transparent text-body"
                  placeholder="Search student or college..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="glass-card p-5 text-center text-muted">Loading students directory...</div>
            ) : students.length > 0 ? (
              <div className="glass-card overflow-hidden">
                <div className="table-responsive">
                  <table className="table align-middle mb-0 text-body">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Student Name</th>
                        <th>Email & Phone</th>
                        <th>College & Dept</th>
                        <th>Key Skills</th>
                        <th>Joined</th>
                        <th className="pe-4 text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id} className="border-bottom border-secondary border-opacity-25">
                          <td className="ps-4 py-3">
                            <div className="fw-bold text-body mb-0">{s.full_name}</div>
                            <span className="badge bg-primary-subtle text-primary extra-small">ID #{s.id}</span>
                          </td>

                          <td className="small">
                            <div><FaEnvelope className="text-muted me-1" /> {s.email}</div>
                            <div className="text-muted"><FaPhone className="text-muted me-1" /> {s.phone}</div>
                          </td>

                          <td className="small">
                            <div><FaUniversity className="text-muted me-1" /> {s.college}</div>
                            <div className="text-muted"><FaGraduationCap className="text-muted me-1" /> {s.department}</div>
                          </td>

                          <td className="small text-muted" style={{ maxWidth: '180px' }}>
                            <span className="text-truncate d-block" title={s.skills}>{s.skills || 'None listed'}</span>
                          </td>

                          <td className="extra-small text-muted">{s.created_at || 'Recent'}</td>

                          <td className="pe-4 text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button 
                                onClick={() => setSelectedStudent(s)}
                                className="btn btn-sm btn-outline-custom p-1.5"
                                title="View Full Profile"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => handleDelete(s.id)}
                                className="btn btn-sm btn-outline-custom p-1.5"
                                title="Delete Student"
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
            ) : (
              <div className="glass-card p-5 text-center text-muted">No student profiles found.</div>
            )}

          </div>

        </div>
      </div>

      {/* Student Profile Modal View */}
      {selectedStudent && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card border-0 shadow-lg">
              <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3">
                <h5 className="modal-title fw-bold text-body">Student Details</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedStudent(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: '48px', height: '48px' }}>
                    {selectedStudent.full_name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">{selectedStudent.full_name}</h5>
                    <span className="text-muted small">{selectedStudent.email}</span>
                  </div>
                </div>
                <hr className="my-3 opacity-25" />
                <div className="d-flex flex-column gap-2 small">
                  <div><strong>Phone:</strong> {selectedStudent.phone}</div>
                  <div><strong>College:</strong> {selectedStudent.college}</div>
                  <div><strong>Department:</strong> {selectedStudent.department}</div>
                  <div><strong>Skills:</strong> {selectedStudent.skills || 'None'}</div>
                  <div><strong>Registered On:</strong> {selectedStudent.created_at}</div>
                </div>
              </div>
              <div className="modal-footer border-top border-secondary border-opacity-25 px-4 py-3">
                <button type="button" className="btn btn-outline-custom btn-sm" onClick={() => setSelectedStudent(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminStudents;
