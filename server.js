const app = require('./app');
// port server will use
const port = 3000;
// start the server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
