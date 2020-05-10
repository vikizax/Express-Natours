const { Router } = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = Router({ mergeParams: true }); // with merge params , to get the params from other routes

router.use(authController.protect);
router.use(authController.restrictTo('user'));

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.setTourUserIds, reviewController.createReview);

router.use(authController.restrictTo('user', 'admin'));

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
