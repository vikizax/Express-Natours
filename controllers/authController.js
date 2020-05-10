const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

// generate jwt token
const signToken = id => {
  // payload, secret, option
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// create token and send it back
const createAndSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // const cookieOption = {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  //   ),
  //   // secure: true, // https
  //   httpOnly: true, //important
  //   secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  // };

  // if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  // if (req.secure || req.headers['x-forwarded-proto'] === 'https')
  //   cookieOption.secure = true;
  // cookieOption.secure =
  //   req.secure || req.headers['x-forwarded-proto'] === 'https';

  // sending jwt token as cookie
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true, // https
    httpOnly: true, //important
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // remove the password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// create user
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createAndSendToken(newUser, 201, req, res);
});

// login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email & password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // check if the user exists & password is correct
  const user = await User.findOne({ email }).select('+password');

  // validate email/pass provided
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect Email or Password', 401));

  // if everything ok, send token to client
  createAndSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

// use for protected routes to validate tokens
exports.protect = catchAsync(async (req, res, next) => {
  // get the tokens and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in!, please login to get access', 401)
    );
  }

  // validate the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if user still exists for the token provided
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The user belonging to this token does not exist', 401)
    );
  // check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password, please login again', 401)
    );

  // grant user acess to protected routes
  // user data added to the req
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

// only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // check if user still exists for the token provided
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();
      // check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) return next();

      // there is a logged in user
      res.locals.user = currentUser; // enbled pug template to access user
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// authorisation -> restrict unauthorised user to admin action route
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // gets access to roles array
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    next();
  };
};

// recieves email, to send password reset link
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  // verify if user exists
  if (!user)
    return next(new AppError('There is no user with email provided', 404));
  // generate random reset token : -> modifies the doc
  const resetToken = user.createPasswordResetToken();
  // save the doc after modify : -> deactivate validator before saving
  await user.save({ validateBeforeSave: false });

  // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf ypu didn't forgot your password, please ignore this email.`;
  // await sendEmail({
  //   email: user.email,
  //   subject: 'Your password reset token (valid for 10 mins)',
  //   message
  // });

  try {
    // send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later', 500)
    );
  }
});

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // if token invalid
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  // token has not expired, and there is a user, set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  // save the changes
  await user.save();
  // update changedPasswordAt property for the user -> userModel pre middleware
  // log the user in and send the JWT
  createAndSendToken(user, 200, req, res);
});

// update logged in user's password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // get the user from the collection
  const user = await User.findById(req.user.id).select('+password');
  // check if the posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong', 401));

  // if password is correct then update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // logged the user in, send JWT
  createAndSendToken(user, 200, req, res);
});
