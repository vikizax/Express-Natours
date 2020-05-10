// review, rating, createdAt, ref to tour, ref to user
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId, // parent ref to tour
      ref: 'Tour',
      required: [true, 'Review mus belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId, // parent ref to user
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  // options
  {
    toJSON: { virtuals: true }, // alow in virtual
    toObject: { virtuals: true }
  }
);

// compund index to prevent user from posting multiple reviews on the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// query middleware
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

// static methods
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // aggrigation pipe line
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    // update the Tours with calculated results
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// middleware
// document middleware
reviewSchema.post('save', function() {
  // calculate review average when it is created
  this.constructor.calcAverageRatings(this.tour);
});

// query middleware
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); // get the doc from the query
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  if (!this.r) {
    return;
  }
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
