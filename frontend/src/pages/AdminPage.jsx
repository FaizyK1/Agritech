import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const AdminPage = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data.data?.counts || null);
      setUsers(usersRes.data.data || []);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to retrieve administrative platform telemetry.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setAlert({ type: 'success', message: 'User role updated successfully!' });
      fetchAdminData();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update user role.' });
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (userId === user?._id) {
      setAlert({ type: 'warning', message: 'Admins cannot delete their own active account.' });
      return;
    }

    if (window.confirm(`Permanently remove user "${name}" from AgriTech?`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setAlert({ type: 'success', message: `User "${name}" removed.` });
        fetchAdminData();
      } catch (err) {
        setAlert({ type: 'danger', message: 'Failed to delete user.' });
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading system-wide governance records..." />;
  }

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold text-dark mb-0">Platform Administration & Governance</h3>
            <span className="badge bg-danger text-white">ADMINISTRATOR ACCESS</span>
          </div>
          <p className="text-muted small mb-0">
            System metrics, user role permissions, marketplace volumes, and platform telemetry
          </p>
        </div>
        <button onClick={fetchAdminData} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Metrics
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Admin KPI Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            unit="Accounts"
            icon="bi-people-fill text-primary"
            subtitle={`${stats?.farmers || 0} Farmers • ${stats?.experts || 0} Experts`}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Agricultural Parcels"
            value={stats?.totalFarms || 0}
            unit="Farms"
            icon="bi-geo-alt-fill text-success"
            subtitle={`${stats?.totalCrops || 0} Active Crops Planted`}
            color="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Total Mandi Orders"
            value={stats?.totalOrders || 0}
            unit="Trades"
            icon="bi-bag-check-fill text-warning"
            subtitle={`GMV: ₹${stats?.totalOrderValue?.toLocaleString() || 0}`}
            color="warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Pest & Advisory Load"
            value={stats?.activeAlerts || 0}
            unit="Outbreaks"
            icon="bi-shield-exclamation text-danger"
            subtitle={`${stats?.pendingConsultations || 0} Queries in Discussion`}
            color="danger"
            isPositive={false}
          />
        </div>
      </div>

      {/* System Telemetry & Database Status */}
      <div className="agri-card p-4 mb-4">
        <h5 className="fw-bold text-dark mb-3">System Health & Backend Infrastructure</h5>
        <div className="row g-3 text-center">
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3">
              <span className="small text-muted d-block">Database</span>
              <strong className="text-success fs-6">MongoDB 8.3 Running</strong>
              <small className="text-muted d-block">127.0.0.1:27017</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3">
              <span className="small text-muted d-block">API Gateway</span>
              <strong className="text-success fs-6">Node.js Express 4.21</strong>
              <small className="text-muted d-block">Port 5000 Active</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3">
              <span className="small text-muted d-block">Security Layer</span>
              <strong className="text-success fs-6">JWT & Bcrypt Hashing</strong>
              <small className="text-muted d-block">Role Guarding Active</small>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3">
              <span className="small text-muted d-block">Weather Engine</span>
              <strong className="text-success fs-6">Open-Meteo Integration</strong>
              <small className="text-muted d-block">Hourly Global Sync</small>
            </div>
          </div>
        </div>
      </div>

      {/* User Directory Management Table */}
      <div className="agri-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Platform User Directory ({users.length})</h5>
            <small className="text-muted">Manage roles and platform permissions</small>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Location</th>
                <th>Contact</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=60&auto=format&fit=crop&q=80'}
                        alt={u.name}
                        className="rounded-circle border"
                        style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong className="d-block text-dark small">{u.name}</strong>
                        <small className="text-muted">{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className={`form-select form-select-sm fw-semibold ${
                        u.role === 'admin' ? 'text-danger' : u.role === 'expert' ? 'text-info' : 'text-success'
                      }`}
                      style={{ width: '115px' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    >
                      <option value="farmer">Farmer</option>
                      <option value="expert">Expert</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="small text-muted">{u.location || 'Punjab Agro Zone'}</td>
                  <td className="small text-muted">{u.phone || 'N/A'}</td>
                  <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    {u._id !== user?._id && (
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="btn btn-sm btn-outline-danger"
                        title="Delete User"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
