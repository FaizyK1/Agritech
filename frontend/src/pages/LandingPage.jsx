import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    try {
      const credentials = {
        farmer: { email: 'farmer@agritech.com', password: 'farmer123' },
        expert: { email: 'expert@agritech.com', password: 'expert123' },
        admin: { email: 'admin@agritech.com', password: 'admin123' }
      }[role];

      await login(credentials.email, credentials.password);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error('Quick demo login error:', err);
      navigate('/login');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="position-relative overflow-hidden pt-5 pb-5" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)' }}>
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-pill mb-3">
                <i className="bi bi-stars"></i> Next-Gen Smart Farming Platform
              </span>
              <h1 className="display-4 fw-extrabold text-dark mb-3 lh-sm">
                Empowering Farmers with <span className="text-success">Precision Agriculture</span>
              </h1>
              <p className="lead text-muted mb-4">
                Manage farm parcels, monitor crop lifecycles, access live meteorological spray advisories, diagnose N-P-K soil health, and trade directly on the agricultural marketplace.
              </p>

              {/* Quick Demo Logins for Project Evaluators */}
              <div className="card p-3 border-0 shadow-sm mb-4 bg-white rounded-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>
                    <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Evaluation Access (Pre-seeded Accounts)
                  </span>
                  <span className="badge bg-light text-dark border">MongoDB 8.3 Ready</span>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickDemo('farmer')}
                    className="btn btn-sm btn-outline-success flex-grow-1 fw-semibold py-2"
                  >
                    👨‍🌾 Login as Farmer
                  </button>
                  <button
                    onClick={() => handleQuickDemo('expert')}
                    className="btn btn-sm btn-outline-info flex-grow-1 fw-semibold py-2"
                  >
                    🔬 Login as Agronomist
                  </button>
                  <button
                    onClick={() => handleQuickDemo('admin')}
                    className="btn btn-sm btn-outline-danger flex-grow-1 fw-semibold py-2"
                  >
                    👑 Login as Admin
                  </button>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Link to="/register" className="btn btn-agri btn-lg px-4 py-3">
                  <i className="bi bi-person-plus-fill"></i> Create Free Account
                </Link>
                <Link to="/login" className="btn btn-agri-outline btn-lg px-4 py-3">
                  <i className="bi bi-box-arrow-in-right"></i> Sign In to Portal
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="position-relative">
                <div className="hero-glass p-4 shadow-lg border border-success border-opacity-25">
                  <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-light">
                    <div className="d-flex align-items-center gap-2">
                      <span className="fs-4">🌾</span>
                      <div>
                        <h6 className="mb-0 fw-bold">Green Horizon Valley Farm</h6>
                        <small className="text-muted">Ludhiana Agro Belt • 24.5 Acres Active</small>
                      </div>
                    </div>
                    <span className="badge-soft-success">Optimal Soil Health</span>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1">Active Crop</small>
                        <strong className="text-dark d-block">Golden Sharbati Wheat</strong>
                        <span className="text-success small fw-semibold">Stage: Flowering (Est. 340 Qtl)</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3">
                        <small className="text-muted d-block mb-1">Weather & Spray</small>
                        <strong className="text-dark d-block">26°C • Clear Sky</strong>
                        <span className="text-success small fw-semibold">Spray Window: Optimal</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-20 d-flex align-items-center justify-content-between">
                    <div>
                      <span className="badge bg-success text-white mb-1">Live Soil Diagnostic</span>
                      <p className="mb-0 small text-dark fw-medium">
                        NPK (295 : 28 : 210 kg/ha) • pH 6.9 • Carbon 0.72%
                      </p>
                    </div>
                    <i className="bi bi-check-circle-fill text-success fs-3"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Pillars Section */}
      <section id="features" className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">
              Comprehensive Capabilities
            </span>
            <h2 className="fw-bold display-6">All Agricultural Operations in One SaaS</h2>
            <p className="text-muted">
              Built specifically for modern farmers, agronomists, and agricultural enterprises.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="agri-card p-4 h-100">
                <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success mb-3">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <h5 className="fw-bold mb-2">Farm Parcel Mapping</h5>
                <p className="text-muted small">
                  Map GPS parcels, track total acreage, soil types (Alluvial, Loamy, Black Cotton), and irrigation infrastructure.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="agri-card p-4 h-100">
                <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info mb-3">
                  <i className="bi bi-flower1"></i>
                </div>
                <h5 className="fw-bold mb-2">Crop Lifecycle & Yield</h5>
                <p className="text-muted small">
                  Monitor vegetative stages from sowing to harvesting, track health status, and forecast expected quintal yields.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="agri-card p-4 h-100">
                <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning mb-3">
                  <i className="bi bi-cloud-sun-fill"></i>
                </div>
                <h5 className="fw-bold mb-2">Live Weather & Spray Index</h5>
                <p className="text-muted small">
                  Live Open-Meteo meteorological data with automated spray drift windows, evapotranspiration, and rain hold alerts.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="agri-card p-4 h-100">
                <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary mb-3">
                  <i className="bi bi-moisture"></i>
                </div>
                <h5 className="fw-bold mb-2">Soil N-P-K Telemetry</h5>
                <p className="text-muted small">
                  Log laboratory soil tests. Calculates automatic fertilizer dosage recommendations for Urea, DAP, MOP, and Zinc.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="agri-card p-4 h-100">
                <div className="stat-icon-wrapper bg-danger bg-opacity-10 text-danger mb-3">
                  <i className="bi bi-bug-fill"></i>
                </div>
                <h5 className="fw-bold mb-2">Pest & Disease Warning</h5>
                <p className="text-muted small">
                  Regional outbreak alerts with symptoms, chemical & biological control protocols, and verified agronomist advisory.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="agri-card p-4 h-100">
                <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success mb-3">
                  <i className="bi bi-shop"></i>
                </div>
                <h5 className="fw-bold mb-2">Mandi & Supplies Marketplace</h5>
                <p className="text-muted small">
                  Direct grain, seeds, bio-fertilizer, and equipment commerce with instant ordering, order tracking, and stock management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-agri-dark text-white text-center">
        <div className="container py-4">
          <h2 className="fw-bold mb-3">Ready to modernize farm management?</h2>
          <p className="lead text-light opacity-75 mb-4 mx-auto" style={{ maxWidth: '640px' }}>
            Join forward-thinking farmers and agricultural experts using AgriTech for data-driven crop yields.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-success btn-lg px-4 py-2 fw-bold">
              Get Started Now
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg px-4 py-2">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
