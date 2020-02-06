const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router(); // creates a middleware Router for tour

// param middleware function
// id will be checked before any other tour middleware to filter out invalid id
router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours) // get all tours
  .post(tourController.checkBody, tourController.createTour); // create tour

router
  .route('/:id')
  .get(tourController.getTour) // get a specific tour
  .patch(tourController.updateTour) // update a specific tour
  .delete(tourController.deleteTour); // delete a speciic tour

module.exports = router;
