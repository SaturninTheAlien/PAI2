'use strict';

const express = require('express');
const router = express.Router();
const userDao = require("../dao/userDao");
const{onClientError, onServerError} = require("../handlers/errorHandler");

const authService = require("../services/authService");

router.use(express.json());

router.post("/login", (req, res)=>{
    authService.login(req.body).then(
        user_o => {
            if(user_o.success){
                res.status(200).json({
                    "user": user_o.user,
                    "token": user_o.token
                });
            }
            else{
                onClientError(res, user_o.status_code, user_o.message);
            }
        }).catch(err => onServerError(res, err));
});

router.get("/my_account", authService.verifyAuth, (req, res)=>{
    userDao.getUser(req.user_id).then(
        user_o => {
            if(user_o.success){
                res.status(200).json(user_o.user);
            }
            else{
                onClientError(res, user_o.status_code, user_o.message);
            }
        }).catch(err => onServerError(res, err));
});

module.exports = router;