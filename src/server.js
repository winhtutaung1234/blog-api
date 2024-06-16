require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { usersRouter } = require("./routers/users");
const server = express();

const portNumber = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("mongodb connected");

    server.listen(portNumber, () => {
      console.log(`server running on port ${portNumber}`);
    });
  })
  .catch((e) => {
    console.error(e.message);
  });

server.use("/api", usersRouter);
