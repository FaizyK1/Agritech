import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-top border-light py-4 mt-auto">
      <div className="container-fluid px-lg-4">
        <div className="row align-items-center justify-content-between g-3">
          <div className="col-12 col-md-6 text-center text-md-start">
            <span className="fw-bold text-success me-2">🌱 AgriTech</span>
            <span className="text-muted small">
              Smart Precision Farming & Agriculture SaaS Platform © {new Date().getFullYear()}. All rights reserved.
            </span>
          </div>
          <div className="col-12 col-md-6 text-center text-md-end">
            <span className="badge bg-light text-muted border me-2 small">
              <i className="bi bi-shield-check text-success"></i> JWT & Role Auth Protected
            </span>
            <span className="badge bg-light text-muted border small">
              <i className="bi bi-database text-success"></i> MongoDB 8.3 Persistent
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
