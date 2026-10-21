import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FaUserGraduate, FaBriefcase, FaClipboardList, FaCheckCircle } from 'react-icons/fa';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      if (res.success && res.data) {
        const d = res.data;
        const m = d.metrics || d;
        setStats({
          ...d,
          total_students: d.total_students ?? m.total_students ?? 0,
          total_jobs: d.total_jobs ?? m.total_jobs ?? 0,
          active_jobs: d.active_jobs ?? m.active_jobs ?? 0,
          total_applications: d.total_applications ?? m.total_applications ?? 0,
          application_status_distribution: d.application_status_distribution || {
            Pending: m.pending_applications || 0,
            Accepted: m.accepted_applications || 0,
            Rejected: m.rejected_applications || 0
          },
          category_distribution: d.category_distribution || {}
        });
      }
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusDist = stats?.application_status_distribution || { Pending: 0, Accepted: 0, Rejected: 0 };
  const catDist = stats?.category_distribution || {};

  // Chart 1: Application Status Doughnut Chart
  const statusChartData = {
    labels: ['Pending Review', 'Accepted', 'Rejected'],
    datasets: [
      {
        data: [statusDist.Pending || 0, statusDist.Accepted || 0, statusDist.Rejected || 0],
        backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  // Chart 2: Category Demand Bar Chart
  const categoryChartData = {
    labels: Object.keys(catDist),
    datasets: [
      {
        label: 'Job Listings Count',
        data: Object.values(catDist),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="row g-4">
          
          {/* Sidebar Navigation */}
          <div className="col-lg-3">
            <AdminSidebar />
          </div>

          {/* Main Dashboard Panel */}
          <div className="col-lg-9">
            
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h2 className="fw-extrabold text-body mb-1">Admin Overview</h2>
                <p className="text-body-secondary small mb-0">System performance metrics and real-time platform statistics.</p>
              </div>
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill px-3 py-1.5 fw-semibold">
                Live Admin Metrics
              </span>
            </div>

            {/* Metric Cards Row */}
            <div className="row g-4 mb-4">
              
              <div className="col-6 col-md-3">
                <div className="glass-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold">Total Students</span>
                    <div className="bg-primary-subtle text-primary p-2.5 rounded-3">
                      <FaUserGraduate className="fs-5" />
                    </div>
                  </div>
                  <h3 className="fw-extrabold text-body mb-0">
                    {loading ? '...' : stats?.total_students || 0}
                  </h3>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="glass-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold">Total Jobs</span>
                    <div className="bg-info-subtle text-info p-2.5 rounded-3">
                      <FaBriefcase className="fs-5" />
                    </div>
                  </div>
                  <h3 className="fw-extrabold text-body mb-0">
                    {loading ? '...' : stats?.total_jobs || 0}
                  </h3>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="glass-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold">Active Jobs</span>
                    <div className="bg-success-subtle text-success p-2.5 rounded-3">
                      <FaCheckCircle className="fs-5" />
                    </div>
                  </div>
                  <h3 className="fw-extrabold text-body mb-0">
                    {loading ? '...' : stats?.active_jobs || 0}
                  </h3>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="glass-card p-4 h-100">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted small fw-semibold">Applications</span>
                    <div className="bg-warning-subtle text-warning p-2.5 rounded-3">
                      <FaClipboardList className="fs-5" />
                    </div>
                  </div>
                  <h3 className="fw-extrabold text-body mb-0">
                    {loading ? '...' : stats?.total_applications || 0}
                  </h3>
                </div>
              </div>

            </div>

            {/* Analytics Charts Row */}
            <div className="row g-4">
              
              {/* Status Breakdown Doughnut */}
              <div className="col-md-5">
                <div className="glass-card p-4 h-100">
                  <h6 className="fw-bold mb-3 text-body">Applications Status Breakdown</h6>
                  {loading ? (
                    <div className="text-center py-5 text-muted">Loading chart data...</div>
                  ) : (
                    <div className="p-3 d-flex justify-content-center" style={{ maxHeight: '280px' }}>
                      <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Category Demand Bar */}
              <div className="col-md-7">
                <div className="glass-card p-4 h-100">
                  <h6 className="fw-bold mb-3 text-body">Job Listings by Category</h6>
                  {loading ? (
                    <div className="text-center py-5 text-muted">Loading chart data...</div>
                  ) : (
                    <div className="p-2" style={{ maxHeight: '280px' }}>
                      <Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
