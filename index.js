#!/usr/bin/node
'use strict';

console.log("Hello world");

const express = require('express');
const db = require('./config/database');

const app = express();

app.get("/hello", (req, res)=>{
    res.status(200).send("Hello world");
});

const apiRouter = express.Router();

apiRouter.use("/auth", require("./routers/authRouter"));
apiRouter.use("/users", require("./routers/userRouter"));

app.use("/api", apiRouter);

app.listen(3002, () => {
    console.log('PAI2 app listening on port 3002!');
});