const express = require('express');
// morgan -> logging third party library
const morgan = require('morgan');
// require the controllers for the route
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// initiate express app
const app = express();
if (process.env.NODE_ENV === 'development') {
  // morgan middleware
  app.use(morgan('dev'));
}

// express middleware
app.use(express.json()); // to get the data from the req body
//serve static file
app.use(express.static(`${__dirname}/public`));
// custom middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.requestTime);
  next();
});
// routing middleware
app.use('/api/v1/tours', tourRouter); // use the tourRouter middleware
app.use('/api/v1/users', userRouter); // use the userRouter middleware

module.exports = app;
