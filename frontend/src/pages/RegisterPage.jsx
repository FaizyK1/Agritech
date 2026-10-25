import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    phone: '',
    location: 'Punjab, India'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        location: formData.location
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-md-3">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6">
          <div className="agri-card p-4 p-md-5 border-0 shadow-lg">
            <div className="text-center mb-4">
              <span className="fs-1">🌾</span>
              <h3 className="fw-bold text-dark mt-2">Join AgriTech</h3>
              <p className="text-muted small">Create your smart farming and agricultural intelligence account</p>
            </div>

            {error && <AlertBanner type="danger" message={error} onClose={() => setError('')} />}

            <form onSubmit={handleSubmit}>
              {/* Role Picker */}
              <div className="mb-4">
                <label className="form-label d-block text-center mb-2">Select Your Platform Role</label>
                <div className="row g-2">
                  <div className="col-4">
                    <button
                      type="button"
                      className={`btn w-100 py-2 d-flex flex-column align-items-center gap-1 ${
                        formData.role === 'farmer' ? 'btn-success text-white' : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleRoleSelect('farmer')}
                    >
                      <span className="fs-5">👨‍🌾</span>
                      <small className="fw-bold">Farmer</small>
                    </button>
                  </div>
                  <div className="col-4">
                    <button
                      type="button"
                      className={`btn w-100 py-2 d-flex flex-column align-items-center gap-1 ${
                        formData.role === 'expert' ? 'btn-info text-white' : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleRoleSelect('expert')}
                    >
                      <span className="fs-5">🔬</span>
                      <small className="fw-bold">Agronomist</small>
                    </button>
                  </div>
                  <div className="col-4">
                    <button
                      type="button"
                      className={`btn w-100 py-2 d-flex flex-column align-items-center gap-1 ${
                        formData.role === 'admin' ? 'btn-danger text-white' : 'btn-outline-secondary'
                      }`}
                      onClick={() => handleRoleSelect('admin')}
                    >
                      <span className="fs-5">👑</span>
                      <small className="fw-bold">Admin</small>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="regName">Full Name</label>
                <input
                  id="regName"
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Jasbir Singh"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="regEmail">Email Address</label>
                <input
                  id="regEmail"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="jasbir@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="regPhone">Phone Number</label>
                  <input
                    id="regPhone"
                    name="phone"
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="regLocation">Region / Agro Zone</label>
                  <input
                    id="regLocation"
                    name="location"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ludhiana, Punjab"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="regPassword">Password</label>
                  <input
                    id="regPassword"
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="regConfirmPassword">Confirm Password</label>
                  <input
                    id="regConfirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="form-control"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i> Complete Registration
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-2 border-top border-light">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="text-success fw-bold text-decoration-none small">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
