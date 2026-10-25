import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <LoadingSpinner message="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5 text-center">
        <div className="agri-card p-5 mx-auto" style={{ maxWidth: '520px' }}>
          <i className="bi bi-shield-lock-fill text-warning fs-1 mb-3"></i>
          <h4 className="fw-bold">Access Restricted</h4>
          <p className="text-muted">
            Your role (<strong className="text-capitalize">{user.role}</strong>) does not have authorization to view this section.
          </p>
          <a href="/dashboard" className="btn btn-agri mt-2">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
