import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/market/orders');
      setOrders(res.data.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to retrieve order history.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Orders & Mandi Purchase History</h3>
          <p className="text-muted small mb-0">
            Real-time fulfillment tracking, dispatched consignments, and invoice receipts
          </p>
        </div>
        <Link to="/marketplace" className="btn btn-agri">
          <i className="bi bi-shop me-1"></i> Browse Marketplace
        </Link>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <LoadingSpinner message="Retrieving order ledger records..." />
      ) : orders.length === 0 ? (
        <div className="agri-card p-5 text-center my-4">
          <i className="bi bi-bag-x text-muted" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-3">No Orders Placed Yet</h4>
          <p className="text-muted mx-auto" style={{ maxWidth: '450px' }}>
            You haven't ordered any seeds, organic fertilizers, or equipment yet. Explore the marketplace to place your first trade.
          </p>
          <Link to="/marketplace" className="btn btn-agri mt-2">
            Go to Marketplace
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map((order) => (
            <div key={order._id} className="agri-card p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3 border-bottom border-light gap-2">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-dark">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <span className={`badge ${
                      order.orderStatus === 'Delivered' ? 'bg-success' : order.orderStatus === 'Dispatched' ? 'bg-primary' : 'bg-warning text-dark'
                    }`}>
                      {order.orderStatus}
                    </span>
                    <span className="badge bg-light text-muted border">
                      {order.paymentStatus}
                    </span>
                  </div>
                  <small className="text-muted">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} • Payment: {order.paymentMethod}
                  </small>
                </div>

                <div className="text-md-end">
                  <span className="text-muted small d-block">Grand Total</span>
                  <span className="fs-5 fw-bold text-success">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="row g-3 mb-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="col-12 col-md-6 col-lg-4">
                    <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                      {item.product?.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.title}
                          className="rounded"
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <strong className="d-block text-dark small text-truncate" style={{ maxWidth: '200px' }}>
                          {item.title}
                        </strong>
                        <small className="text-muted">
                          Qty: {item.quantity} {item.unit} • ₹{item.price} each
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address Footer */}
              <div className="p-3 bg-light rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="small text-muted">
                  <i className="bi bi-truck text-success me-1"></i>
                  <strong>Shipping to:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} ({order.shippingAddress?.postalCode}) • Phone: {order.shippingAddress?.phone}
                </div>
                <span className="badge bg-white text-muted border small">
                  Est. Delivery: {order.deliveryEstimate || '3-5 Days'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
