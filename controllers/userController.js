/**
 * users route controller
 */
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// setup file storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // setting up destination for the uploaded file
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user- user id- timestamp. file extension
//     const ext = file.mimetype.split('/')[1];
//     // set the filename
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
// store it in memory instead of disk to perform additional operation on image
const multerStorage = multer.memoryStorage();

// filter out only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// const upload = multer({ dest: 'public/img/users' });
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    // filename: user_id-timestamp.file_extension
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// user update action
exports.updateMe = catchAsync(async (req, res, next) => {
  // create error if user post password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password update, please use /updateMyPassword',
        400
      )
    );
  // update user document
  // filtered unwanted data that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  // mongoose update, and ran validators again
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// user action: delete user
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// admin action
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
