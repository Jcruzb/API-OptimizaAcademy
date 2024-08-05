require("dotenv").config();
// Importar librerías
const express = require('express');
const logger = require("morgan");
const mongoose = require("mongoose");
const createError = require("http-errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const cors = require("cors");

require("./config/db.config");

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// app.use(cors())

// app.use(cors(
//   {
//     origin: process.env.CORS_ORIGINJC || ["http://localhost:5173","http://127.0.0.1:5173"],
//     credentials: true,
//   }
// ))




  //configurar el servidor
app.use(logger("dev"));
app.use(express.json());



app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

//rutas
const usersRouter = require("./routes/user.routes");
app.use("/users", usersRouter);

const coursesRouter = require("./routes/courses.routes");
app.use("/courses", coursesRouter);

const testsRouter = require("./routes/test.routes");
app.use("/test", testsRouter);

const companysRouter = require("./routes/companies.routes");
app.use("/companies", companysRouter);

//route not found
app.use((req, res, next) => {
    next(createError(StatusCodes.NOT_FOUND, "Route not found"));
  });
  
  //error handler
  app.use((error, req, res, next) => {
    res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR);
    res.json({ error: error.message });
  });
  
//listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});




