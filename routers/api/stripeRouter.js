'use strict';
const express = require("express");
const router = express();
const env = require("../../config/env");
const{onClientError, onServerError} = require("../../handlers/errorHandler");

const stripe = require("../../config/stripe");

router.get("/config", (_req, res) => {
    res.status(200).json({
        publishable_key: env.STRIPE_PUBLISHABLE_KEY
    });
});

router.get("/create-test-payment-intent", (_req, res)=>{
    stripe.paymentIntents.create({
        currency: "PLN",
        amount: 1399,
        automatic_payment_methods: { enabled: true }
    }).then(payment_intent=>{
        res.status(200).json({
            client_secret: payment_intent.client_secret
        });
    }).catch(err => onServerError(res, err));
});

router.post("/webhook", (req, res)=>{
    async function f(req, res){
        let data, eventType;

        // Check if webhook signing is configured.
        if (env.STRIPE_WEBHOOK_SECRET) {
            // Retrieve the event by verifying the signature using the raw body and secret.
            let event;
            let signature = req.headers['stripe-signature'];
            try {
                event = stripe.webhooks.constructEvent(
                    req.rawBody,
                    signature,
                    process.env.STRIPE_WEBHOOK_SECRET
                );
            } catch (err) {
                onClientError(res, 400, `⚠️  Webhook signature verification failed.`);
                return;
            }
            data = event.data;
            eventType = event.type;
        } else {
            // Webhook signing is recommended, but if the secret is not configured in `config.js`,
            // we can retrieve the event data directly from the request body.
            data = req.body.data;
            eventType = req.body.type;
        }

        if (eventType === 'payment_intent.succeeded') {
            // Funds have been captured
            // Fulfill any orders, e-mail receipts, etc
            // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
            console.log('💰 Payment captured!');
        } else if (eventType === 'payment_intent.payment_failed') {
            console.log('❌ Payment failed.');
        }
        res.sendStatus(200);
    }
    if(!req.originalUrl.startsWith('/stripe/webhook')){
        onClientError(res, 403, "Forbidden url");
    }
    else{
        f(req, res).catch(err => onServerError(res, err));
    }
});

module.exports = router;