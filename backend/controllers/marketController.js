import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get all marketplace products
// @route   GET /api/market/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, status } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .populate('seller', 'name email phone location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/market/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email phone location bio');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product listing
// @route   POST /api/market/products
// @access  Private
export const createProduct = async (req, res, next) => {
  try {
    const { title, category, description, price, unit, stockQuantity, location, imageUrl } = req.body;

    const product = await Product.create({
      seller: req.user._id,
      title,
      category,
      description,
      price: Number(price),
      unit: unit || 'quintal',
      stockQuantity: Number(stockQuantity) || 1,
      location: location || req.user.location || 'Local Mandi',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=80',
      status: Number(stockQuantity) > 0 ? 'Available' : 'Out of Stock'
    });

    const populatedProduct = await Product.findById(product._id).populate('seller', 'name location phone');

    res.status(201).json({ success: true, data: populatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product listing
// @route   PUT /api/market/products/:id
// @access  Private
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this listing' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('seller', 'name');

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/market/products/:id
// @access  Private
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new order
// @route   POST /api/market/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
      return res.status(400).json({ success: false, message: 'Please provide full shipping address details' });
    }

    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.title}` });
      }

      const qty = Number(item.quantity) || 1;
      calculatedTotal += product.price * qty;

      orderItems.push({
        product: product._id,
        title: product.title,
        price: product.price,
        quantity: qty,
        unit: product.unit,
        seller: product.seller
      });

      // Adjust stock
      if (product.stockQuantity >= qty) {
        product.stockQuantity -= qty;
        if (product.stockQuantity === 0) {
          product.status = 'Out of Stock';
        }
        await product.save();
      }
    }

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'Direct UPI (Demo)' ? 'Paid' : 'Pending',
      orderStatus: 'Confirmed',
      notes: notes || ''
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('items.seller', 'name phone location');

    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get orders (buyer's orders or admin all)
// @route   GET /api/market/orders
// @access  Private
export const getOrders = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      // If farmer or seller, get orders where they are buyer or seller
      query = {
        $or: [
          { buyer: req.user._id },
          { 'items.seller': req.user._id }
        ]
      };
    }

    const orders = await Order.find(query)
      .populate('buyer', 'name email phone')
      .populate('items.product', 'imageUrl title category')
      .populate('items.seller', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/market/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
