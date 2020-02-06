/**
 * REST API ARCHITECTURE:
 * 1.Separate API into logical resourses -> object or representatio of something (name not verb)
 * /getTour -> GET /tours/7 --tour id
 * /addNewTour -> POST /tours
 * /updateTour -> PUT /tours/7 or PATCH /tours/7
 * /deleteTour -> DELETE /tours/7
 * end point name is same but HTTP method differs --> good practice
 *
 * 2. Send data as JSON
 * 3. Should always be stateless -> good -> /tours/page/6 | bad /tours/nextPage -> server side state management is bad
 *
 */
// routing with mehtods
// get mothod
// app.get("/", (req, res) => {
//   //   res.status(200).send("hello from the server side! 😀");
//   //   res.send("<h1>Hello world</h1>");
//   res
//     .status(200)
//     .json({ message: "hello from the server side! 😀", app: "Natours" });
// });

// // post method
// app.post("/", (req, res) => {
//   res.status(200).send("You can post to this endpoint...");
// });

// good practice to specify the api version with api

// routes
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
// tour route api
// custom middleware
// app.use((req, res, next) => {
//     console.log('Hello from the middleware 👋');
//     // to go the next stage
//     next();
//   });
//   // custom middleware
//   app.use((req, res, next) => {
//     req.requestTime = new Date().toISOString();
//     next();
//   });
