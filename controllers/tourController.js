/**
 * tour route controllers
 */

const fs = require('fs');
// text to json
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  if (val * 1 > tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: 'failed',
      message: 'Missing name or price'
    });
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length)
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  const tour = tours.find(el => el.id == id);

  res.status(200).json({
    status: 'success',
    tour
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  // writes to the file
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      if (err)
        return res.status(500).json({
          status: 'error',
          message: 'Server error: Could not save the data 😞'
        });
      // 201 created
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  // 204 no content to send back
  res.status(204).json({
    status: 'success',
    data: null
  });
};
