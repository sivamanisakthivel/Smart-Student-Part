import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`d-flex align-items-center justify-content-between p-3 rounded-3 shadow-lg border text-white transition-all`}
          style={{
            minWidth: '300px',
            maxWidth: '420px',
            backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
            borderColor: 'rgba(255,255,255,0.2)'
          }}
        >
          <div className="d-flex align-items-center gap-2">
            {toast.type === 'success' && <FaCheckCircle className="fs-5" />}
            {toast.type === 'error' && <FaExclamationTriangle className="fs-5" />}
            {toast.type === 'info' && <FaInfoCircle className="fs-5" />}
            <span className="fw-medium small">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="btn btn-sm text-white p-0 ms-3 border-0 bg-transparent opacity-75 opacity-100-hover"
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
