'use strict';

const express = require('express');
const router = express.Router();

const{onClientError, onServerError} = require("../handlers/errorHandler");
const{verifyAuth} = require("../services/authService");

router.use(express.json());
router.use(verifyAuth);
const cartDao = require("../dao/cartDao");

router.get("/", (req, res)=>{
    cartDao.allCartItemsByUserId(req.user_id).then(cart_items=>{
        res.status(200).json(cart_items);
    }).catch(err => onServerError(res, err));
});

router.post("/", (req, res)=>{
    cartDao.addProductToCart(req.user_id, req.body).then(op=>{
        if(op.success){
            res.status(200).json(op.cart_item);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }
    }).catch(err => onServerError(res, err));
});

router.put("/:id(\\d+)/quantity", (req, res)=>{
    const pk = Number.parseInt(req.params.id);
    cartDao.setQuantity(pk, req.body, req.user_id).then(op=>{
        if(op.success){
            if(op.status_code===204){
                res.sendStatus(204);
            }
            else{
                res.status(op.status_code).json(op.cart_item);
            }
        }
        else{
            onClientError(res, op.status_code, op.message);
        }
    }).catch(err => onServerError(res, err));
});

router.delete("/:id(\\d+)", (req, res)=>{
    const pk = Number.parseInt(req.params.id);
    cartDao.deleteCartItem(pk, req.user_id).then(op=>{
        if(op.success){
            res.sendStatus(204);
        }
        else{
            onClientError(res, op.status_code, op.message);
        }
    }).catch(err => onServerError(res, err));
});

router.delete("/", (req, res)=>{
    cartDao.clearCart(req.user_id).then(function(){
        res.sendStatus(204);
    }).catch(err => onServerError(res, err));
});



module.exports = router;