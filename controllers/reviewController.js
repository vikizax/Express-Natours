const Review = require('../models/reviewModel');

const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; // id from url
  if (!req.body.user) req.body.user = req.user.id; // user id from authController.protect
  next();
};

// get all the reviews
exports.getAllReviews = factory.getAll(Review);

// create new review
exports.createReview = factory.createOne(Review);

// delete a specific review
exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.getReview = factory.getOne(Review);
