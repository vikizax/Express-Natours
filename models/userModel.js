const crypto = require('crypto');
const mongoose = require('mongoose');
const { isEmail } = require('validator').default;
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please tell us your name!'] },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please provide a valid email']
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guid', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this -> only works for SAVE/CREATE
      validator: function(val) {
        return this.password === val;
      },
      message: 'Password does not match'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// hash the password before saving
userSchema.pre('save', async function(next) {
  // if password is not modified return else hash the password
  if (!this.isModified('password')) return next();
  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // do not persist the confirm password to database
  this.passwordConfirm = undefined;
  next();
});

// set passwordChangedAt property
userSchema.pre('save', function(next) {
  // password not modified or doc isNew, return
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// remove the inactive user
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// instance method to compare if given password matches the password stored in db
userSchema.methods.correctPassword = function(candidatePassword, userPassword) {
  // .compare -> async
  return bcrypt.compare(candidatePassword, userPassword);
};

// instance method to check if the password changed after the token is issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// instance method to generate random string for password reset
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
