import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const CATEGORIES = [
  'All',
  'Grains & Cereals',
  'Fresh Produce',
  'Certified Seeds',
  'Bio Fertilizers & Soil Nutrients',
  'Eco-Friendly Pesticides',
  'Smart Farming Tools & Equipment'
];

const MarketplacePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Cart State
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: 'Kisan Agro Complex, GT Road',
    city: 'Ludhiana',
    state: 'Punjab',
    postalCode: '141001',
    paymentMethod: 'Cash on Delivery',
    notes: ''
  });

  // Sell Modal State
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellForm, setSellForm] = useState({
    title: '',
    category: 'Grains & Cereals',
    description: '',
    price: '',
    unit: 'quintal',
    stockQuantity: '',
    location: user?.location || 'Central Mandi',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=80'
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/market/products';
      const params = [];
      if (selectedCategory !== 'All') params.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setProducts(res.data.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load marketplace products.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = (product) => {
    const existing = cart.find((item) => item.product._id === product._id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setAlert({ type: 'success', message: `Added "${product.title}" to cart!` });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.product._id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      const itemsPayload = cart.map((item) => ({
        product: item.product._id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        unit: item.product.unit
      }));

      await api.post('/market/orders', {
        items: itemsPayload,
        shippingAddress: {
          fullName: shippingForm.fullName,
          phone: shippingForm.phone,
          street: shippingForm.street,
          city: shippingForm.city,
          state: shippingForm.state,
          postalCode: shippingForm.postalCode
        },
        paymentMethod: shippingForm.paymentMethod,
        notes: shippingForm.notes
      });

      setCart([]);
      setShowCartModal(false);
      navigate('/orders');
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Error creating order.'
      });
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/market/products', {
        ...sellForm,
        price: Number(sellForm.price),
        stockQuantity: Number(sellForm.stockQuantity)
      });
      setAlert({ type: 'success', message: 'Product listed on marketplace successfully!' });
      setShowSellModal(false);
      fetchProducts();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to list product.'
      });
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Title & Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Agricultural Mandi & Supplies Marketplace</h3>
          <p className="text-muted small mb-0">
            Direct farmer-to-farmer trade for certified seeds, farm harvest, organic manure, and precision machinery
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => setShowCartModal(true)}
            className="btn btn-outline-success position-relative"
          >
            <i className="bi bi-cart3"></i> Cart
            {cart.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cart.length}
              </span>
            )}
          </button>
          <button onClick={() => setShowSellModal(true)} className="btn btn-agri">
            <i className="bi bi-plus-circle me-1"></i> List Product for Sale
          </button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Search & Category Pills Filter */}
      <div className="agri-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="mb-3">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search wheat, seeds, bio-fertilizer, tractor tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-agri">
              Search Mandi
            </button>
          </div>
        </form>

        <div className="d-flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${
                selectedCategory === cat ? 'btn-success text-white' : 'btn-light text-muted'
              } fw-semibold`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying agricultural marketplace inventory..." />
      ) : products.length === 0 ? (
        <div className="agri-card p-5 text-center my-4">
          <i className="bi bi-shop text-muted" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-3">No Products Found</h4>
          <p className="text-muted mx-auto" style={{ maxWidth: '450px' }}>
            No agricultural supplies match your search query or category filter. Be the first to list a product!
          </p>
          <button onClick={() => setShowSellModal(true)} className="btn btn-agri mt-2">
            <i className="bi bi-plus-lg"></i> List New Product
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((item) => (
            <div key={item._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="agri-card h-100 d-flex flex-column">
                <div className="position-relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-100 object-fit-cover"
                    style={{ height: '180px' }}
                  />
                  <span className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white">
                    {item.category}
                  </span>
                </div>

                <div className="p-3 flex-grow-1 d-flex flex-column">
                  <h6 className="fw-bold text-dark mb-1 text-truncate" title={item.title}>
                    {item.title}
                  </h6>
                  <small className="text-muted mb-2 d-block">
                    <i className="bi bi-geo-alt-fill text-success me-1"></i> {item.location}
                  </small>
                  <p className="small text-muted mb-3 flex-grow-1 lh-sm" style={{ minHeight: '38px' }}>
                    {item.description?.slice(0, 85)}...
                  </p>

                  <div className="d-flex justify-content-between align-items-baseline mb-3">
                    <div>
                      <span className="fs-5 fw-bold text-success">₹{item.price}</span>
                      <small className="text-muted"> / {item.unit}</small>
                    </div>
                    <small className="text-muted">
                      Stock: <strong>{item.stockQuantity}</strong>
                    </small>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="btn btn-agri-soft w-100 d-flex align-items-center justify-content-center gap-2"
                    disabled={item.stockQuantity <= 0}
                  >
                    <i className="bi bi-cart-plus"></i>
                    {item.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Shopping Cart & Checkout */}
      {showCartModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-cart3 me-2"></i> Shopping Cart & Direct Mandi Checkout
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCartModal(false)}></button>
              </div>

              <div className="modal-body p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-cart-x text-muted fs-1"></i>
                    <p className="text-muted mt-2">Your shopping cart is currently empty.</p>
                  </div>
                ) : (
                  <>
                    <h6 className="fw-bold text-dark mb-3">Cart Items ({cart.length})</h6>
                    <div className="table-responsive mb-4">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cart.map((item) => (
                            <tr key={item.product._id}>
                              <td>
                                <strong className="d-block text-dark small">{item.product.title}</strong>
                                <small className="text-muted">{item.product.unit}</small>
                              </td>
                              <td className="small">₹{item.product.price}</td>
                              <td className="small">{item.quantity}</td>
                              <td className="fw-bold text-success small">
                                ₹{item.product.price * item.quantity}
                              </td>
                              <td>
                                <button
                                  onClick={() => handleRemoveFromCart(item.product._id)}
                                  className="btn btn-sm btn-link text-danger p-0"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" className="fw-bold text-end">Grand Total:</td>
                            <td colSpan="2" className="fs-5 fw-bold text-success">₹{cartTotal}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <h6 className="fw-bold text-dark mb-3">Delivery & Shipping Address</h6>
                    <form onSubmit={handleCheckout}>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="shipNameInput">Recipient Name</label>
                          <input
                            id="shipNameInput"
                            type="text"
                            className="form-control"
                            value={shippingForm.fullName}
                            onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label" htmlFor="shipPhoneInput">Contact Phone</label>
                          <input
                            id="shipPhoneInput"
                            type="tel"
                            className="form-control"
                            value={shippingForm.phone}
                            onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label" htmlFor="shipStreetInput">Street / Farm Village Address</label>
                          <input
                            id="shipStreetInput"
                            type="text"
                            className="form-control"
                            value={shippingForm.street}
                            onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="shipCityInput">City / District</label>
                          <input
                            id="shipCityInput"
                            type="text"
                            className="form-control"
                            value={shippingForm.city}
                            onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="shipStateInput">State</label>
                          <input
                            id="shipStateInput"
                            type="text"
                            className="form-control"
                            value={shippingForm.state}
                            onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="shipPostalInput">Postal PIN</label>
                          <input
                            id="shipPostalInput"
                            type="text"
                            className="form-control"
                            value={shippingForm.postalCode}
                            onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-12 mt-2">
                          <label className="form-label" htmlFor="shipPaySelect">Payment Preference</label>
                          <select
                            id="shipPaySelect"
                            className="form-select"
                            value={shippingForm.paymentMethod}
                            onChange={(e) => setShippingForm({ ...shippingForm, paymentMethod: e.target.value })}
                          >
                            <option value="Cash on Delivery">Cash on Delivery (Pay at Mandi/Farm Gate)</option>
                            <option value="Direct UPI (Demo)">Direct UPI / QR Code (Instant Demo Settlement)</option>
                            <option value="Kisan Credit / AgroCard">Kisan Credit Card (Agro Credit Scheme)</option>
                          </select>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowCartModal(false)}>
                          Continue Shopping
                        </button>
                        <button type="submit" className="btn btn-agri">
                          Confirm & Place Order (₹{cartTotal})
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: List Product for Sale */}
      {showSellModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">List Agricultural Produce / Machinery for Sale</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSellModal(false)}></button>
              </div>

              <form onSubmit={handleCreateProduct}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label" htmlFor="sellTitleInput">Product Title</label>
                      <input
                        id="sellTitleInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Organic Sharbati Wheat or Certified Mustard Seeds"
                        value={sellForm.title}
                        onChange={(e) => setSellForm({ ...sellForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="sellCatSelect">Category</label>
                      <select
                        id="sellCatSelect"
                        className="form-select"
                        value={sellForm.category}
                        onChange={(e) => setSellForm({ ...sellForm, category: e.target.value })}
                      >
                        {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="sellPriceInput">Price (₹)</label>
                      <input
                        id="sellPriceInput"
                        type="number"
                        className="form-control"
                        placeholder="e.g. 2800"
                        value={sellForm.price}
                        onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="sellUnitSelect">Unit</label>
                      <select
                        id="sellUnitSelect"
                        className="form-select"
                        value={sellForm.unit}
                        onChange={(e) => setSellForm({ ...sellForm, unit: e.target.value })}
                      >
                        <option value="quintal">quintal</option>
                        <option value="kg">kg</option>
                        <option value="bag (50kg)">bag (50kg)</option>
                        <option value="ton">ton</option>
                        <option value="box">box</option>
                        <option value="piece">piece</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="sellStockInput">Stock Quantity</label>
                      <input
                        id="sellStockInput"
                        type="number"
                        className="form-control"
                        placeholder="e.g. 50"
                        value={sellForm.stockQuantity}
                        onChange={(e) => setSellForm({ ...sellForm, stockQuantity: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="sellLocInput">Mandi / Dispatch Location</label>
                      <input
                        id="sellLocInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Samrala Grain Market, Punjab"
                        value={sellForm.location}
                        onChange={(e) => setSellForm({ ...sellForm, location: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="sellImgInput">Image URL</label>
                      <input
                        id="sellImgInput"
                        type="url"
                        className="form-control"
                        value={sellForm.imageUrl}
                        onChange={(e) => setSellForm({ ...sellForm, imageUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="sellDescInput">Product Description & Moisture Details</label>
                      <textarea
                        id="sellDescInput"
                        rows="2"
                        className="form-control"
                        placeholder="Quality specifications, moisture %, organic certification..."
                        value={sellForm.description}
                        onChange={(e) => setSellForm({ ...sellForm, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowSellModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri">
                    Publish Listing to Mandi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
