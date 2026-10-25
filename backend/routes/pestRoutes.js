import express from 'express';
import {
  getPestAlerts,
  getPestAlertById,
  createPestAlert,
  updatePestAlert,
  deletePestAlert
} from '../controllers/pestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getPestAlerts);
router.get('/:id', getPestAlertById);

// Protected routes
router.post('/', protect, createPestAlert);
router.put('/:id', protect, updatePestAlert);
router.delete('/:id', protect, deletePestAlert);

export default router;
