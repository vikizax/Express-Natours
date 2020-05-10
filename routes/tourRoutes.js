const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router(); // creates a middleware Router for tour

const authController = require('../controllers/authController');

const reviewRouter = require('../routes/reviewRoutes');

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/').get(tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// protected routes, need authentication
router.use(authController.protect);

// routes only for admin leadguide and guide
router.use(authController.restrictTo('admin', 'lead-guide', 'guide'));

router
  .route('/monthly-plan/:year')
  .get(
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// route only for admin and lead-guide
router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  // .get(tourController.getAllTours) // get all tours
  .post(tourController.createTour); // create tour

router
  .route('/:id')
  .get(tourController.getTour) // get a specific tour
  .patch(
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  ) // update a specific tour
  .delete(tourController.deleteTour); // delete a speciic tour

module.exports = router;
