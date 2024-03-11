require("dotenv").config();

const express = require("express");
const app = express();

const cors = require("cors");
const { articlesRouter } = require("./routers/articles");
const { usersRouter } = require("./routers/users");
app.use(cors());

app.use(articlesRouter);
app.use(usersRouter);

app.listen(process.env.PORT, () => {
    console.log(`server running at port ${process.env.PORT}`);
});