const slugify = require('slugify');
const mongoose = require('mongoose');
const valid = require('validator');
// schema for the Tour model
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have less or equal 40 characters'],
      minlength: [10, 'A tour name must have more or equal 10 characters'],
      validate: {
        validator: function(value) {
          return valid.isAlpha(value.replace(/ /g, ''));
        },
        message: 'Tour name ({VALUE}) must only contain character'
      }
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // setter function used to round the ratings value
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          return value < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a size']
    },
    difficulty: {
      type: String,
      require: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    // array of string
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    // array of date
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSOM, geo data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // referencing solution, user guide reference
    guides: [
      {
        type: mongoose.Schema.ObjectId, // user id
        ref: 'User' // refers to User document
      }
    ]
  },
  // options
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// compound index
tourSchema.index({ price: 1, ratingsAverage: -1 }); // 1 means assending
// single field index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // index for geo data

// virtual properties
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// mongoose middleware:
// document middleware (run before an .save() and .create() not on insertMany)
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// query middleware
// trigger for all find event
tourSchema.pre(/^find/, function(next) {
  // this -> query object
  // filter out secret tours
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} mils`);
//   next();
// });

// aggrigation middleware
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// creating Tour model
const Tour = mongoose.model('Tour', tourSchema);

// export Tour model
module.exports = Tour;
