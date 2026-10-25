import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="app-sidebar d-none d-lg-flex">
      <div className="p-3 border-bottom border-light">
        <div className="d-flex align-items-center gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="rounded-circle border"
            style={{ width: '42px', height: '42px', objectFit: 'cover' }}
          />
          <div className="overflow-hidden">
            <h6 className="mb-0 fw-bold text-truncate">{user?.name}</h6>
            <small className="text-muted d-block text-truncate">
              <i className="bi bi-geo-alt-fill text-success" style={{ fontSize: '0.75rem' }}></i> {user?.location || 'Punjab Agro Zone'}
            </small>
          </div>
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto py-3">
        <div className="px-3 mb-2">
          <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
            Farm Operations
          </span>
        </div>

        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/farms" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-geo-fill"></i>
          <span>My Farms</span>
        </NavLink>

        <NavLink to="/crops" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-flower1"></i>
          <span>Crops & Yield</span>
        </NavLink>

        <NavLink to="/weather" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-cloud-sun-fill"></i>
          <span>Weather & Forecast</span>
        </NavLink>

        <NavLink to="/soil" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-moisture"></i>
          <span>Soil Health (NPK)</span>
        </NavLink>

        <NavLink to="/pests" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bug-fill"></i>
          <span>Pest & Disease Alerts</span>
        </NavLink>

        <div className="px-3 mt-4 mb-2">
          <span className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
            Commerce & Experts
          </span>
        </div>

        <NavLink to="/marketplace" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-shop-window"></i>
          <span>Marketplace</span>
        </NavLink>

        <NavLink to="/orders" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-bag-check-fill"></i>
          <span>My Orders</span>
        </NavLink>

        <NavLink to="/consultations" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
          <i className="bi bi-chat-heart-fill"></i>
          <span>Expert Advisory</span>
        </NavLink>

        {user?.role === 'admin' && (
          <>
            <div className="px-3 mt-4 mb-2">
              <span className="text-uppercase text-danger fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                System Administration
              </span>
            </div>
            <NavLink to="/admin" className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-shield-lock-fill text-danger"></i>
              <span className="text-danger fw-semibold">Admin Panel</span>
            </NavLink>
          </>
        )}
      </div>

      <div className="p-3 bg-light border-top border-light mt-auto">
        <div className="p-2 bg-white rounded border border-light text-center">
          <span className="badge bg-success bg-opacity-10 text-success mb-1">
            <i className="bi bi-broadcast"></i> Telemetry Live
          </span>
          <p className="small text-muted mb-0" style={{ fontSize: '0.75rem' }}>
            Open-Meteo & Soil Sensor Node Active
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
