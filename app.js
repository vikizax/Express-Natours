const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
// morgan -> logging third party library
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// require the controllers for the route
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

// initiate express app
const app = express();

//  trust proxy
app.enable('trust proxy');

// set up view engine
app.set('view engine', 'pug'); // ->-> res.render()
// set views folder
app.set('views', path.join(__dirname, 'views'));

// implement cors
app.use(cors()); // Access-Control-Allow-Origin *

// allow cors on all option for all routes
app.options('*', cors());

// app.options('/api/v1/tours:id', cors());

// developer logging
if (process.env.NODE_ENV === 'development') {
  // morgan middleware
  app.use(morgan('dev'));
}

// origin specific cors
// app.use(cors({
//   origin: 'https://www.something.com'
// }))

// set security http headers
app.use(helmet());

// rate limiter: limits request from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'To many request from this IP, please try again in an hour'
});
app.use('/api', limiter);

// stripe web hook
app.post(
  '/webhook-checkout',
  express.raw({
    type: 'application/json'
  }),
  bookingController.webhookCheckout
);

// express middleware
// to get the data from the req body
app.use(
  express.json({
    limit: '10kb' // body limited to 10kb
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // use the form data | parse data of url encoded form
app.use(cookieParser());

// data sanitization against NoSQL query injection
app.use(mongoSanitize());
// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//serve static file
// app.use(express.static(`${__dirname}/public`));
app.use(
  express.static(path.join(__dirname, 'public'), {
    cacheControl: true,
    setHeaders: res => {
      res.set('Cache-Control', 'public', 'max-age=300, s-maxage=600');
    }
  })
);

// compression for text base replt
app.use(compression());

// custom middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
// routing middleware
app.use('/', viewRouter); // use the viewRouter middleware
// app.use('/api/v1/tours', cors(), tourRouter); // use the tourRouter middleware
app.use('/api/v1/tours', tourRouter); // use the tourRouter middleware
app.use('/api/v1/users', userRouter); // use the userRouter middleware
app.use('/api/v1/reviews', reviewRouter); // use the reviewRouter middleware
app.use('/api/v1/booking', bookingRouter); // use the bookingRoutes middleware

// handler for not found routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on the server`, 404));
});

// error controller
app.use(globalErrorHandler);

module.exports = app;
