'use strict';

const express = require('express');
const router = express.Router();
const{onClientError, onServerError} = require("../handlers/errorHandler");
const googleOauthService = require("../services/googleOauthService");


router.get("/google/login", (req, res)=>{
    const redirect_url = googleOauthService.getRedirectUrl(req.query.state_url);
    if(redirect_url==null){
        res.status(503).send("503: Env variable GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set.");
    }
    else{
        res.redirect(redirect_url);
    }
});

router.get("/google/callback", (req, res)=>{
    if(req.query.code==null){
        res.status(400).send("Required \"code\" query parameter.");
    }
    else{
        googleOauthService.login(req.query.code).then(op=>{
            if(op.success){
                if(req.query.state==null){
                    res.status(200).json(op.auth);
                }
                else{
                    let url = new URL(req.query.state);
                    url.searchParams.set("token", op.auth.token);
                    res.redirect(url.toString());
                }
            }
            else{
                res.status(op.status_code).send(`${op.status_code}: ${op.message}`);
            }            
        }).catch(err => onServerError(res, err));
    }
});

module.exports = router;