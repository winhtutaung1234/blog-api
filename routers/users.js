require("dotenv").config();

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}));
router.use(bodyParser.json());

const { MongoClient, ObjectId } = require("mongodb");
const mongo = new MongoClient(process.env.MONGO_HOST);
const db = mongo.db("blog");
const usersdb = db.collection("users");

const {
    body,
    validationResult,
} = require("express-validator");

const { auth } = require("../middlewares/auth");

router.get("/verify", auth, async (req, res) => {
    try {
        return res.json(res.locals.user);
        
    }catch(e) {
        return res.status(500).json({
            msg: e.message,
        });
    }
});

router.post("/register",
[
    body("name").notEmpty(),
    body("email").notEmpty().isEmail(),
    body("city").notEmpty(),
    body("password")
        .notEmpty()
        .isLength({min: 6}).withMessage("Password must be atleast 6 characters long."),
],
async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({
            error: error.array(),
        });
    }

    const { name, email, city, password } = req.body;
    let hash = await bcrypt.hash(password, 10);

    try {
        const result = await usersdb.insertOne({ name, email, city, password: hash});
        const data = await usersdb.findOne({_id: new ObjectId(result.insertedId)});
        return res.json(data);
    }catch(e) {
        return res.status(500).json({
            msg: e.message,
        });
    }
});

router.post("/login", 
[
    body("email").notEmpty().isEmail(),
    body("password").notEmpty(),
],
async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        return res.status(400).json({
            error: error.array(),
        });
    }
    
    try {
        const { email, password } = req.body;
        const user = await usersdb.findOne(
            { email },
            {
                projection: {
                    city: 0,
                }
            }
        );
        if(user) {
            if(await bcrypt.compare(password, user.password)) {
                const token = jwt.sign(user, process.env.JWT_SECRET);
                return res.json({ token });
            }
        }

        return res.status(401).json({
            msg: "incorrect email or password"
        });

    }catch(e) {
        return res.status(500).json({
            msg: e.message,
        });
    }
});

module.exports = { usersRouter: router };