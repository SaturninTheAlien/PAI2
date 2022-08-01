#!/usr/bin/node
'use strict';
require('dotenv').config()
const {ALLOWED_CORS} = require("./config/env")

console.log("Hello world");

const express = require('express');
const db = require('./config/database');

const app = express();

app.get("/hello", (req, res)=>{
    res.status(200).send("Hello world");
});

const apiRouter = express.Router();
const cors = require("cors");
apiRouter.use(cors({ origin: ALLOWED_CORS, credentials: true }));

apiRouter.use("/auth", require("./routers/authRouter"));
apiRouter.use("/cart", require("./routers/cartRouter"));
apiRouter.use("/categories", require("./routers/categoriesRouter"));
apiRouter.use("/products", require("./routers/productsRouter"));
apiRouter.use("/users", require("./routers/userRouter"));

app.use("/api", apiRouter);
app.use("/auth", require("./routers/oauthRouter"));

app.use(express.static(__dirname + '/public'));
app.listen(8080, () => {
    console.log('PAI2 app listening on port 8080!');
});