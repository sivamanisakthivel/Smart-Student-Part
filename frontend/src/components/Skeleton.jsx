import React from 'react';

export const JobCardSkeleton = () => (
  <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
    <div>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="skeleton" style={{ width: '60%', height: '24px' }}></div>
        <div className="skeleton rounded-pill" style={{ width: '80px', height: '20px' }}></div>
      </div>
      <div className="skeleton mb-2" style={{ width: '40%', height: '16px' }}></div>
      <div className="skeleton mb-3" style={{ width: '50%', height: '16px' }}></div>
      <div className="skeleton mb-2" style={{ width: '100%', height: '14px' }}></div>
      <div className="skeleton mb-4" style={{ width: '80%', height: '14px' }}></div>
    </div>
    <div className="d-flex gap-2 pt-3 border-top border-secondary opacity-25">
      <div className="skeleton flex-grow-1" style={{ height: '36px', borderRadius: '8px' }}></div>
      <div className="skeleton" style={{ width: '40px', height: '36px', borderRadius: '8px' }}></div>
    </div>
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="glass-card p-4">
    <div className="skeleton mb-2" style={{ width: '30%', height: '16px' }}></div>
    <div className="skeleton" style={{ width: '50%', height: '32px' }}></div>
  </div>
);
