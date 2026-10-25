import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.data?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    const creds = {
      farmer: { email: 'farmer@agritech.com', pass: 'farmer123' },
      expert: { email: 'expert@agritech.com', pass: 'expert123' },
      admin: { email: 'admin@agritech.com', pass: 'admin123' }
    }[role];

    setEmail(creds.email);
    setPassword(creds.pass);
    setError('');
  };

  return (
    <div className="container py-5 my-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="agri-card p-4 p-md-5 border-0 shadow-lg">
            <div className="text-center mb-4">
              <span className="fs-1">🌱</span>
              <h3 className="fw-bold text-dark mt-2">Welcome Back</h3>
              <p className="text-muted small">Sign in to your AgriTech farming intelligence portal</p>
            </div>

            {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

            {/* Quick Demo Credentials Autofill */}
            <div className="p-3 bg-light rounded-3 mb-4 border border-light">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
                  <i className="bi bi-magic text-warning me-1"></i> Quick Fill Demo Accounts
                </span>
                <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '0.65rem' }}>1-Click</span>
              </div>
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => fillCredentials('farmer')}
                >
                  Farmer
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info"
                  onClick={() => fillCredentials('expert')}
                >
                  Agronomist
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => fillCredentials('admin')}
                >
                  Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="loginEmail">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    id="loginEmail"
                    type="email"
                    className="form-control border-start-0"
                    placeholder="name@farm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="form-label" htmlFor="loginPassword">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock text-muted"></i>
                  </span>
                  <input
                    id="loginPassword"
                    type="password"
                    className="form-control border-start-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-agri w-100 py-2 fs-6 justify-content-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i> Sign In to Account
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-2 border-top border-light">
              <span className="text-muted small">Don't have an account yet? </span>
              <Link to="/register" className="text-success fw-bold text-decoration-none small">
                Register as Farmer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
