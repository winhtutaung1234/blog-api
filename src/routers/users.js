const express = require("express");
const UserController = require("../controllers/UserController");
const router = express.Router();

router.get("/users", UserController.find);

router.post("/sign-up");

router.post("/sign-in");

module.exports = { usersRouter: router };
