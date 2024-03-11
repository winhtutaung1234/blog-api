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

const { 
    param,
    validationResult,
} = require("express-validator");
const users = require("./users");

router.get("/articles", async (req, res) => {
    try {
        const data = await articlesCollection.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                }
            },
            { $unwind: "$owner" },
            { $sort: { _id: -1 }},
        ]).toArray();

        return res.json(data);
    }catch(e) {
        return res.status(500).json({msg: e.message});
    }
});

router.get("/articles/:id", 
[
    param("id").notEmpty().isMongoId(),
],
async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({
            error: error.array()
        });
    }

    const { id } = req.params;
    
    try {
        const article = await articlesCollection.findOne({_id: new ObjectId(id)});
        return res.json(article);
    }catch(e) {
        return res.status(500).json({msg: e.message});
    }

});

module.exports = { articlesRouter: router };