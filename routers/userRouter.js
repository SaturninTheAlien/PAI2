'use strict';

const express = require('express');
const router = express.Router();
const userDao = require("../dao/userDao");

const{onClientError, onServerError} = require("../handlers/errorHandler");
const{verifyAuthAdmin} = require("../services/authService");


router.use(verifyAuthAdmin);
router.use(express.json());

router.get('/', (req, res) => {
    userDao.allUsers()
        .then(users =>{
            res.status(200).json(users)
        }).catch(err => onServerError(res, err))
})

router.get('/:id(\\d+)', (req, res) => {
    let user_id = req.params.id;
    userDao.getUser(user_id).then(
        user_o => {
            if(user_o.success){
                res.status(200).json(user_o.user);
            }
            else{
                onClientError(res, user_o.status_code, user_o.message);
            }
        }).catch(err => onServerError(res, err));
})

router.post('/', (req, res) => {
    userDao.postUser(req.body, true)
        .then(
            user_o => {
            if(user_o.success){
                res.status(201).json(user_o.user);
            }
            else{
                onClientError(res, user_o.status_code, user_o.message);
            }

        }).catch(err => onServerError(res, err));
})

router.put('/:id(\\d+)', (req,res) => {
    userDao.putUser(req.params.id, req.body, true).then(
            user_o => {
            if(user_o.success){
                res.status(200).json(user_o.user);
            }
            else{
                onClientError(res, user_o.status_code, user_o.message);
            }
        }).catch(err => onServerError(res, err));
})

router.delete('/:id(\\d+)', (req, res) => {
    userDao.deleteUser(req.params.id)
        .then(user_o => {
            if(user_o.success){
                res.sendStatus(204);
            }
            else{
                onClientError(res, user_o.status_code, user_o.message);
            }
        }).catch(err => onServerError(res, err));
})

module.exports = router;