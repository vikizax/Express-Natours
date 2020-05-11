const { Router } = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController.js');

const router = Router();
router.use(authController.protect);
router.get('/checkout-session/:tourID', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.delelteBooking);

module.exports = router;
