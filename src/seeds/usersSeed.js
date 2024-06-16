require("dotenv").config();
const mongoose = require("mongoose");

const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const num_of_users = 5;
let users = [];

const passString = "password";

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((e) => {
    console.log(e.message);
  });

async function seedUser() {
  for (let i = 0; i < num_of_users; i++) {
    // Corrected the loop condition
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const password = await bcrypt.hash(passString, 10);

    users.push({
      name,
      email,
      password,
    });
  }
  ``;
  console.log("started users seeding");
  try {
    const data = await User.insertMany(users);
    console.log(data);
    console.log("done users seeding");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}

seedUser();
