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
    body,
} = require("express-validator");
const { auth } = require("../middlewares/auth");

const multer = require("multer");
const imageUpload = multer({ dest: "public/images/"});

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

router.get("/articles/profile/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const data = await articlesCollection.aggregate([
            {
                $match: {
                    owner: new ObjectId(id),
                }
            }, 
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: "$owner"
            },
            { $sort: { _id: -1 }},
        ])
        .toArray();

        return res.json(data);

    }catch(e) {
        return res.status(500).json({
            msg: e.message,
        });
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

router.post("/articles", auth, imageUpload.single("image"),
[
    body("title").notEmpty(),
    body("body").notEmpty(),
],
async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({
            error: error.array(),
        });
    }

    const { title, body } = req.body;
    
    let filename = null;
    if(req.file) {
        filename = req.file.filename;
    }

    try {

        const user_id = res.locals.user._id;
        const result = await articlesCollection.insertOne({ 
            image: filename,
            title,
            body,
            owner: new ObjectId(user_id),
            created: new Date(),
        });

        const data = await articlesCollection.findOne({ _id: new ObjectId(result.insertedId) });
        return res.json(data);
        
    }catch(e) {
        res.status(500).json({
            msg: e.message,
        });
    }
});

router.delete("/articles/:id", 
[
    param("id").notEmpty().isMongoId(),
],
async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({
            error: error.array(),
        });
    }

    try {
        const { id } = req.params;
        await articlesCollection.deleteOne({ _id: new ObjectId(id) });
        return res.json(204);
    }catch(e) {
        return res.status(500).json({
            msg: e.message,
        });
    }
});

module.exports = { articlesRouter: router };