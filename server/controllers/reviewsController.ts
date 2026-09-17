import { Request, Response, NextFunction } from 'express';
import { reviewsService } from '../services/reviewsService';
import { ValidatedReviewRequest } from '../middleware/validator';
import { AppError } from '../errors/AppError';

export class ReviewsController {
  /**
   * POST /api/reviews
   * Initiates an audit for the requested portfolio URL.
   */
  static async createReview(req: ValidatedReviewRequest, res: Response, next: NextFunction) {
    try {
      const url = req.validatedUrl || req.body.url;
      const domain = req.validatedDomain || new URL(url).hostname;

      const { review, analysis } = await reviewsService.createReview(url, domain);

      return res.status(201).json({
        success: true,
        message: 'Portfolio review created and saved successfully.',
        id: review.id,
        url: review.url,
        domain: review.domain,
        overall_score: review.overall_score ?? review.overallScore,
        overallScore: review.overallScore,
        ui_ux_score: review.ui_ux_score ?? review.uiUx ?? review.scores.uiUx,
        uiUx: review.uiUx ?? review.scores.uiUx,
        performance_score: review.performance_score ?? review.performance ?? review.scores.performance,
        performance: review.performance ?? review.scores.performance,
        accessibility_score: review.accessibility_score ?? review.accessibility ?? review.scores.accessibility,
        accessibility: review.accessibility ?? review.scores.accessibility,
        content_score: review.content_score ?? review.content ?? review.scores.content,
        content: review.content ?? review.scores.content,
        summary: review.summary,
        roast: review.roast,
        strengths: review.strengths,
        issues: review.issues.map((i) => ({
          id: i.id,
          title: i.title,
          severity: i.severity,
          description: i.description,
          category: i.category,
        })),
        suggestions: review.suggestions.map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          impact: s.impact,
        })),
        created_at: review.created_at ?? review.createdAt,
        createdAt: review.createdAt,
        data: {
          ...review,
          analysis,
        },
        analysis,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/reviews
   * Retrieves all saved reviews.
   */
  static async getAllReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewsService.getAllReviews();

      return res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/reviews/:id
   * Retrieves a specific review by ID.
   */
  static async getReviewById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const review = await reviewsService.getReviewById(id);

      if (!review) {
        return next(AppError.notFound(`Portfolio review with ID "${id}" was not found.`));
      }

      return res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/reviews/:id
   * Deletes a review by ID.
   */
  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await reviewsService.deleteReview(id);

      if (!deleted) {
        return next(AppError.notFound(`Portfolio review with ID "${id}" was not found.`));
      }

      return res.status(200).json({
        success: true,
        message: `Portfolio review "${id}" successfully deleted.`,
        id,
      });
    } catch (error) {
      return next(error);
    }
  }
}
