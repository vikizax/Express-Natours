const { Schema, model } = require('mongoose');

const bookingSchema = new Schema({
  tour: {
    type: Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour!']
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user!']
  },
  price: {
    type: Number,
    require: [true, 'Booking must have a price']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

// auto populate when booking is queried
bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name'
  });
  next();
});

const Booking = model('Booking', bookingSchema);

module.exports = Booking;
