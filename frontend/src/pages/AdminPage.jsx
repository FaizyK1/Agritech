import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const PRODUCT_CATEGORIES = [
  'All',
  'Fresh Produce',
  'Grains & Cereals',
  'Certified Seeds',
  'Bio Fertilizers & Soil Nutrients',
  'Eco-Friendly Pesticides',
  'Smart Farming Tools & Equipment'
];

const PRODUCT_STATUSES = [
  'All',
  'Available',
  'Low Stock',
  'Out of Stock'
];

const AdminPage = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Marketplace Product Management State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('All');
  const [productStatus, setProductStatus] = useState('All');
  const [productActionLoading, setProductActionLoading] = useState({});

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

  const fetchProducts = async (
    search = productSearch,
    category = productCategory,
    status = productStatus
  ) => {
    try {
      setProductsLoading(true);
      let url = '/market/products';
      const params = [];
      if (category && category !== 'All') {
        params.push(`category=${encodeURIComponent(category)}`);
      }
      if (status && status !== 'All') {
        params.push(`status=${encodeURIComponent(status)}`);
      }
      if (search && search.trim()) {
        params.push(`search=${encodeURIComponent(search.trim())}`);
      }
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await api.get(url);
      setProducts(res.data.data || []);
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to retrieve marketplace products.'
      });
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    fetchProducts(productSearch, productCategory, productStatus);
  }, [productCategory, productStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(productSearch, productCategory, productStatus);
  };

  const handleResetFilters = () => {
    setProductSearch('');
    setProductCategory('All');
    setProductStatus('All');
    fetchProducts('', 'All', 'All');
  };

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

  // Product Admin Actions
  const handleUpdateProductStatus = async (productId, newStatus) => {
    try {
      setProductActionLoading((prev) => ({ ...prev, [productId]: true }));
      const res = await api.put(`/market/products/${productId}`, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId ? { ...p, status: res.data.data?.status || newStatus } : p
        )
      );
      setAlert({
        type: 'success',
        message: `Product status updated to "${newStatus}" successfully.`
      });
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update product status.'
      });
    } finally {
      setProductActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleDeleteProduct = async (productId, title) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete listing "${title}"?\n\nThis action cannot be undone.`
      )
    ) {
      try {
        setProductActionLoading((prev) => ({ ...prev, [productId]: true }));
        await api.delete(`/market/products/${productId}`);
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        setAlert({ type: 'success', message: `Listing "${title}" deleted successfully.` });
      } catch (err) {
        setAlert({
          type: 'danger',
          message: err.response?.data?.message || 'Failed to delete product listing.'
        });
      } finally {
        setProductActionLoading((prev) => ({ ...prev, [productId]: false }));
      }
    }
  };

  const handleRefreshAll = () => {
    fetchAdminData();
    fetchProducts(productSearch, productCategory, productStatus);
  };

  if (loading) {
    return <LoadingSpinner message="Loading system-wide governance records..." />;
  }

  const isFiltered = productSearch.trim() !== '' || productCategory !== 'All' || productStatus !== 'All';

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
        <button onClick={handleRefreshAll} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh All Data
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
      <div className="agri-card p-4 mb-4">
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

      {/* Marketplace Product Management Section */}
      <div className="agri-card p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold text-dark mb-0">Marketplace Product Management</h5>
              <span className="badge bg-success-subtle text-success border border-success-subtle">
                {products.length} {products.length === 1 ? 'Product' : 'Products'} Listed
              </span>
            </div>
            <small className="text-muted">
              Inspect vendor offerings, update product availability statuses, and moderate inappropriate listings
            </small>
          </div>
          <button
            onClick={() => fetchProducts(productSearch, productCategory, productStatus)}
            className="btn btn-sm btn-outline-success"
            disabled={productsLoading}
            title="Refresh product listings"
          >
            <i className={`bi bi-arrow-clockwise me-1 ${productsLoading ? 'spin' : ''}`}></i>
            Refresh Products
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-light p-3 rounded-3 mb-3">
          <div className="row g-2 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title, seller, or location..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {productSearch && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setProductSearch('');
                        fetchProducts('', productCategory, productStatus);
                      }}
                      title="Clear search"
                    >
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
                <button type="submit" className="btn btn-sm btn-primary">
                  Search
                </button>
              </form>
            </div>

            {/* Category Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-4 col-md-2">
              <select
                className="form-select form-select-sm"
                value={productStatus}
                onChange={(e) => setProductStatus(e.target.value)}
              >
                {PRODUCT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All Statuses' : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filter Button */}
            <div className="col-12 col-sm-2 col-md-2 text-sm-end">
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-sm btn-outline-secondary w-100"
                >
                  <i className="bi bi-x-circle me-1"></i> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Product Table / States */}
        {productsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading products...</span>
            </div>
            <p className="mt-2 text-muted small mb-0">Retrieving marketplace inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-box-seam display-4 text-muted mb-2 d-block"></i>
            <h6 className="fw-bold text-dark">No marketplace products found</h6>
            <p className="text-muted small mb-3">
              {isFiltered
                ? 'No items matched your current search and filter settings.'
                : 'There are currently no products published on the marketplace.'}
            </p>
            {isFiltered && (
              <button onClick={handleResetFilters} className="btn btn-sm btn-outline-success">
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: '220px' }}>Product</th>
                  <th style={{ minWidth: '160px' }}>Seller</th>
                  <th style={{ minWidth: '150px' }}>Category</th>
                  <th style={{ minWidth: '110px' }}>Price / Unit</th>
                  <th style={{ minWidth: '100px' }}>Stock</th>
                  <th style={{ minWidth: '130px' }}>Location</th>
                  <th style={{ minWidth: '150px' }}>Status & Availability</th>
                  <th style={{ minWidth: '100px' }}>Listed Date</th>
                  <th style={{ minWidth: '80px' }} className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isBusy = !!productActionLoading[p._id];

                  return (
                    <tr key={p._id}>
                      {/* Product Thumbnail & Title */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={
                              p.imageUrl ||
                              'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={p.title}
                            className="rounded border flex-shrink-0"
                            style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="overflow-hidden">
                            <strong className="d-block text-dark text-truncate small" title={p.title}>
                              {p.title}
                            </strong>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                              ID: {p._id.slice(-6)}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Seller Name & Email */}
                      <td>
                        <span className="d-block fw-semibold text-dark small text-truncate">
                          {p.seller?.name || 'Unknown Seller'}
                        </span>
                        <small className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                          {p.seller?.email || 'N/A'}
                        </small>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="badge bg-success-subtle text-success border border-success-subtle text-wrap text-start" style={{ fontSize: '0.75rem' }}>
                          {p.category}
                        </span>
                      </td>

                      {/* Price & Unit */}
                      <td>
                        <strong className="text-dark small">₹{p.price?.toLocaleString()}</strong>
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                          per {p.unit}
                        </small>
                      </td>

                      {/* Stock Quantity */}
                      <td>
                        <span
                          className={`badge ${
                            p.stockQuantity === 0
                              ? 'bg-danger text-white'
                              : p.stockQuantity <= 5
                              ? 'bg-warning text-dark'
                              : 'bg-light text-dark border'
                          }`}
                        >
                          {p.stockQuantity} {p.unit}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="small text-muted">
                        <i className="bi bi-geo-alt text-danger me-1"></i>
                        <span className="text-truncate">{p.location || 'Local Mandi'}</span>
                      </td>

                      {/* Status / Availability Dropdown */}
                      <td>
                        <select
                          className={`form-select form-select-sm fw-semibold ${
                            p.status === 'Available'
                              ? 'border-success text-success'
                              : p.status === 'Low Stock'
                              ? 'border-warning text-warning-emphasis'
                              : 'border-danger text-danger'
                          }`}
                          style={{ width: '135px' }}
                          value={p.status}
                          disabled={isBusy}
                          onChange={(e) => handleUpdateProductStatus(p._id, e.target.value)}
                        >
                          <option value="Available">Available</option>
                          <option value="Low Stock">Low Stock</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      </td>

                      {/* Creation Date */}
                      <td className="small text-muted">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Admin Actions */}
                      <td className="text-center">
                        <button
                          onClick={() => handleDeleteProduct(p._id, p.title)}
                          className="btn btn-sm btn-outline-danger"
                          disabled={isBusy}
                          title="Delete inappropriate listing"
                        >
                          {isBusy ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
