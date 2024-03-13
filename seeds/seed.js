require("dotenv").config();

const { faker, ar } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const { MongoClient } = require('mongodb');
const mongo = new MongoClient(process.env.MONGO_HOST);
const db = mongo.db("blog");

const num_of_users = 10;
const num_of_posts = 20;

async function seedUsers() {
    await db.collection("users").deleteMany({});
    let users = [];

    const hash = await bcrypt.hash("password", 10);

    for(let i = 0; i <=  num_of_users; i++) {
        const name = faker.person.fullName();
        const email = faker.internet.email();
        const password = hash;
        const profile = null;
        const city = faker.location.city();

        users.push({
            name,
            email,
            city,
            profile,
            password,
            created: new Date(),
        });
    }

    try {
        return await db.collection("users").insertMany(users);
    }catch(e) {
        console.log(e);
    }finally {
        console.log("done users seeding...");
    }
}

async function seedArticles(usersId) {
    await db.collection("articles").deleteMany({});

    let articles = [];

    for(let i = 0; i <= num_of_posts; i++) {
        articles.push({
            title: faker.lorem.sentence(),
            body: faker.lorem.paragraph(),
            owner: usersId[Math.floor(Math.random() * num_of_users)],
            created: new Date(),
        });
    }

    try {
        return await db.collection("articles").insertMany(articles);
    }catch(e) {
        console.log(e);
    }finally {
        console.log("done articles seeding...");
    }
}

async function seed() {
    console.log("started users seeding...");
    const users = await seedUsers();

    console.log("started articles seeding...");
    const articles = await seedArticles(users.insertedIds);
    
}

seed();