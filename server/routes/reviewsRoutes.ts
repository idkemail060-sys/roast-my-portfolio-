import { Router } from 'express';
import { ReviewsController } from '../controllers/reviewsController';
import { validateReviewUrl, validateReviewIdParam } from '../middleware/validator';

const router = Router();

// POST /api/reviews - Audit a portfolio URL
router.post('/', validateReviewUrl, ReviewsController.createReview);

// GET /api/reviews - List all audits
router.get('/', ReviewsController.getAllReviews);

// GET /api/reviews/:id - Retrieve audit report by ID
router.get('/:id', validateReviewIdParam, ReviewsController.getReviewById);

// DELETE /api/reviews/:id - Delete audit report by ID
router.delete('/:id', validateReviewIdParam, ReviewsController.deleteReview);

export default router;
