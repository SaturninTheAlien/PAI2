'use strict';
const express = require('express');
const router = express.Router();

const cors = require("cors");
const {ALLOWED_CORS, CONFIG_JSON} = require("../config/env");

router.use(cors({ origin: ALLOWED_CORS, credentials: true }));
router.use(express.json());

router.use("/auth", require("./api/authRouter"));
router.use("/cart", require("./api/cartRouter"));
router.use("/categories", require("./api/categoriesRouter"));
router.use("/orders", require("./api/ordersRouter"));
router.use("/products", require("./api/productsRouter"));
router.use("/stripe", require("./api/stripeRouter"));
router.use("/users", require("./api/userRouter"));

router.get("/config", (_req, res)=>{
    res.status(200).json(CONFIG_JSON);
});

module.exports = router;