import axios from 'axios';

// Base API URL targeting backend service (configured via Vercel Services rewrites or VITE_API_BASE_URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('student_job_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract clean backend error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
    error.customMessage = message;
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (studentData) => api.post('/auth/register', studentData),
  login: (credentials) => api.post('/auth/login', credentials),
  verifyOTP: (otpPayload) => api.post('/auth/verify-otp', otpPayload),
  resendOTP: (emailPayload) => api.post('/auth/resend-otp', emailPayload),
  getCurrentUser: () => api.get('/auth/me'),
};

// Job Services
export const jobService = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobDetail: (jobId) => api.get(`/jobs/${jobId}`),
  applyJob: (jobId, payload) => {
    const data = typeof payload === 'string' ? { cover_note: payload } : payload;
    return api.post(`/jobs/${jobId}/apply`, data);
  },
  toggleSaveJob: (jobId) => api.post(`/jobs/${jobId}/save`),
  getCategories: () => api.get('/categories'),
};

// Student Services
export const studentService = {
  getDashboardStats: () => api.get('/student/dashboard'),
  getApplications: () => api.get('/student/applications'),
  getSavedJobs: () => api.get('/student/saved-jobs'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (profileData) => api.put('/student/profile', profileData),
};

// Admin Services
export const adminService = {
  login: (credentials) => api.post('/admin/login', credentials),
  getStats: () => api.get('/admin/stats'),
  getStudents: (params) => api.get('/admin/students', { params }),
  deleteStudent: (studentId) => api.delete(`/admin/students/${studentId}`),
  getJobs: () => api.get('/admin/jobs'),
  createJob: (jobData) => api.post('/admin/jobs', jobData),
  updateJob: (jobId, jobData) => api.put(`/admin/jobs/${jobId}`, jobData),
  deleteJob: (jobId) => api.delete(`/admin/jobs/${jobId}`),
  getApplications: () => api.get('/admin/applications'),
  updateAppStatus: (appId, status) => api.put(`/admin/applications/${appId}/status`, { status }),
};

// Upload Services (Cloudinary / File Upload)
export const uploadService = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export default api;
