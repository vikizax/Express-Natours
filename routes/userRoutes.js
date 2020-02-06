const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router(); // creates a middleware Router for user

// user route api
router
  .route('/')
  .get(userController.getAllUsers) // get all the users
  .post(userController.createUser); // create a user
router
  .route('/:id')
  .get(userController.getUser) // get a specific user
  .patch(userController.updateUser) // update a specific user
  .delete(userController.deleteUser); // delete a specific user

module.exports = router;
