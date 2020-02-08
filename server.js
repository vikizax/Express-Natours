const dotenv = require('dotenv');

dotenv.config({
  path: './config.env'
});

const app = require('./app');

// port server will use
const port = process.env.PORT || 3000;
// start the server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
