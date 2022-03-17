const express = require('express');
const {} = require("dotenv/config");
const connectDB = require('./config/database');
const redis = require('redis');
const responseTime = require('response-time')
const { log } = require("./logger");
const routes = require("./src/routes");


const app = express();
const client = redis.createClient();


//connect db
connectDB();

//print redis errors
client.on('error', (err) => {
    console.log("Error" + err);
})

app.use(responseTime());

//init Middleware
app.use(express.json({ extended: false }))

//Define routes
app.use('', routes);

// Catching none-existing routes and other errors
app.use((req, res, next) => {
    const error = new Error("Route not found!");
    error.status = 404;
    next(error);
  });
  
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.send({
      status: error,
      message: error.message,
    });
  });

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));