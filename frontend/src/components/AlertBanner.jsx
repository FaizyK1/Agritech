import React from 'react';

const AlertBanner = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const typeConfig = {
    success: { icon: 'bi-check-circle-fill', bg: 'alert-success', text: 'text-success' },
    danger: { icon: 'bi-exclamation-triangle-fill', bg: 'alert-danger', text: 'text-danger' },
    warning: { icon: 'bi-exclamation-circle-fill', bg: 'alert-warning', text: 'text-warning' },
    info: { icon: 'bi-info-circle-fill', bg: 'alert-info', text: 'text-info' }
  }[type] || { icon: 'bi-info-circle', bg: 'alert-info', text: 'text-info' };

  return (
    <div className={`alert ${typeConfig.bg} d-flex align-items-center alert-dismissible fade show border-0 shadow-sm`} role="alert">
      <i className={`bi ${typeConfig.icon} me-2 fs-5`}></i>
      <div className="flex-grow-1 fw-medium">{message}</div>
      {onClose && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
      )}
    </div>
  );
};

export default AlertBanner;
