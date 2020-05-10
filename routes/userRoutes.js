const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router(); // creates a middleware Router for user

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// sequence middleware to protect the following routes below it
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

// admin action route
router.use(authController.restrictTo('admin'));

// user route api
router.route('/').get(userController.getAllUsers); // get all the users
// .post(userController.createUser); // create a user
router
  .route('/:id')
  .get(userController.getUser) // get a specific user
  .patch(userController.updateUser) // update a specific user
  .delete(userController.deleteUser); // delete a specific user

module.exports = router;
