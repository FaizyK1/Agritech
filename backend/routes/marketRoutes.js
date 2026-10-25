import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  getOrders,
  updateOrderStatus
} from '../controllers/marketController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', protect, createProduct);
router.put('/products/:id', protect, updateProduct);
router.delete('/products/:id', protect, deleteProduct);

// Orders
router.get('/orders', protect, getOrders);
router.post('/orders', protect, createOrder);
router.put('/orders/:id/status', protect, updateOrderStatus);

export default router;
