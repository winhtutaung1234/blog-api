require("dotenv").config();

const express = require("express");
const router = express.Router();

const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

const { MongoClient, ObjectId } = require("mongodb");
const mongo = new MongoClient(process.env.MONGO_HOST);
const db = mongo.db("blog");
const articlesCollection = db.collection("articles");

router.get("/articles", async (req, res) => {
    try {
        const data = await articlesCollection.find().toArray();
        return res.json(data);
    }catch(e) {
        return res.status(500).json({msg: e.message});
    }
});

module.exports = { articlesRouter: router };