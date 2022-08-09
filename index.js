#!/usr/bin/node
'use strict';
require('dotenv').config()

console.log("Hello world");

const express = require('express');
const app = express();

app.get("/hello", (_req, res)=>{
    res.status(200).send("Hello world");
});

app.use("/api", require("./routers/apiRouter"));
app.use("/auth", require("./routers/oauthRouter"));

app.use(express.static(__dirname + '/public'));
app.listen(8080, () => {
    console.log('PAI2 app listening on port 8080!');
});