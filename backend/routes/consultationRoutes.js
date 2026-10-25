import express from 'express';
import {
  getConsultations,
  getConsultationById,
  createConsultation,
  replyConsultation,
  updateConsultationStatus
} from '../controllers/consultationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getConsultations)
  .post(createConsultation);

router.route('/:id')
  .get(getConsultationById);

router.post('/:id/reply', replyConsultation);
router.put('/:id/status', updateConsultationStatus);

export default router;
