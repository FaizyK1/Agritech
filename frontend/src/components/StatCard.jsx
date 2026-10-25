import React from 'react';

const StatCard = ({ title, value, unit = '', icon, change, isPositive = true, color = 'success', subtitle }) => {
  return (
    <div className="stat-card h-100">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h3 className="mb-0 mt-1 fw-bold text-dark">
            {value} <span className="fs-6 text-muted fw-normal">{unit}</span>
          </h3>
        </div>
        <div className={`stat-icon-wrapper bg-${color} bg-opacity-10 text-${color}`}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      {(change || subtitle) && (
        <div className="d-flex align-items-center mt-2 pt-2 border-top border-light">
          {change && (
            <span className={`badge ${isPositive ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${isPositive ? 'text-success' : 'text-warning'} me-2 fw-semibold`}>
              <i className={`bi bi-arrow-${isPositive ? 'up' : 'down'}-short`}></i> {change}
            </span>
          )}
          {subtitle && <small className="text-muted text-truncate">{subtitle}</small>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
