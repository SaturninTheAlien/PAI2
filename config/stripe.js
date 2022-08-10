'use strict';
const env = require("./env");
const stripe = require("stripe")(env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
});

module.exports = stripe;