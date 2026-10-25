import express from 'express';
import { getSoilTests, getSoilTestById, createSoilTest, deleteSoilTest } from '../controllers/soilController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSoilTests)
  .post(createSoilTest);

router.route('/:id')
  .get(getSoilTestById)
  .delete(deleteSoilTest);

export default router;
