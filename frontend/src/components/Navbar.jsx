import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom border-light shadow-sm sticky-top">
      <div className="container-fluid px-lg-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to={isAuthenticated ? '/dashboard' : '/'}>
          <span className="fs-3">🌱</span>
          <span className="fw-bold text-success" style={{ letterSpacing: '-0.03em', fontSize: '1.4rem' }}>
            Agri<span className="text-dark">Tech</span>
          </span>
          <span className="badge bg-success bg-opacity-10 text-success ms-1 fw-bold px-2 py-1" style={{ fontSize: '0.68rem' }}>
            PRO
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#agriNavbarNav"
          aria-controls="agriNavbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="agriNavbarNav">
          {isAuthenticated ? (
            <div className="navbar-nav ms-auto align-items-lg-center gap-2 py-2 py-lg-0">
              <Link to="/weather" className="nav-link d-flex align-items-center gap-1 text-muted px-2">
                <i className="bi bi-cloud-sun text-warning"></i> Weather
              </Link>
              <Link to="/marketplace" className="nav-link d-flex align-items-center gap-1 text-muted px-2">
                <i className="bi bi-shop text-success"></i> Mandi / Market
              </Link>
              <Link to="/consultations" className="nav-link d-flex align-items-center gap-1 text-muted px-2">
                <i className="bi bi-chat-dots-fill text-info"></i> Ask Expert
              </Link>

              <div className="dropdown ms-lg-3">
                <button
                  className="btn btn-outline-light text-dark border d-flex align-items-center gap-2 px-3 py-1 dropdown-toggle"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&auto=format&fit=crop&q=80'}
                    alt={user?.name}
                    className="rounded-circle border"
                    style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                  />
                  <span className="fw-semibold small">{user?.name}</span>
                  <span className={`badge ms-1 ${
                    user?.role === 'admin' ? 'bg-danger' : user?.role === 'expert' ? 'bg-info' : 'bg-success'
                  } text-white text-uppercase`} style={{ fontSize: '0.65rem' }}>
                    {user?.role}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="userDropdown">
                  <li>
                    <h6 className="dropdown-header text-truncate">Signed in as {user?.email}</h6>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/dashboard">
                      <i className="bi bi-speedometer2 text-success"></i> Dashboard
                    </Link>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2" to="/admin">
                        <i className="bi bi-shield-check text-danger"></i> Admin Portal
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="navbar-nav ms-auto align-items-lg-center gap-2 py-2 py-lg-0">
              <Link to="/#features" className="nav-link text-muted px-2">
                Features
              </Link>
              <Link to="/#about" className="nav-link text-muted px-2">
                Platform
              </Link>
              <Link to="/login" className="btn btn-agri-outline btn-sm ms-lg-2">
                <i className="bi bi-box-arrow-in-right"></i> Sign In
              </Link>
              <Link to="/register" className="btn btn-agri btn-sm">
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
