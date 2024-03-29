'use strict';

const express = require('express');
const router = express.Router();
const orderDao = require("../../dao/orderDao");

const{verifyAuth, verifyAuthAdmin} = require("../../services/authService");
const{onClientError, onServerError} = require("../../handlers/errorHandler");

router.get("/", verifyAuthAdmin, (req, res)=>{
    orderDao.allOrders().then(orders=>{
        res.status(200).json(orders);

    }).catch(err => onServerError(res, err));
});

router.get("/my", verifyAuth, (req, res)=>{
    orderDao.allOrdersByUser(req.user_id).then(orders=>{
        res.status(200).json(orders);

    }).catch(err => onServerError(res, err));
});

router.get("/:id(\\d+)", verifyAuth, (req, res)=>{
    const pk = Number.parseInt(req.params.id);
    orderDao.getOrder(pk, req.user_id, req.user_admin).then(order_o=>{
        if(order_o.success){
            res.status(200).json(order_o.order);
        }
        else{
            onClientError(res, order_o.status_code, order_o.message);
        }
    }).catch(err => onServerError(res, err));
});

router.delete("/:id", verifyAuth, (req, res)=>{
    const pk = Number.parseInt(req.params.id);
    orderDao.cancelOrder(pk, req.user_id, req.user_admin).then(order_o=>{
        if(order_o.success){
            res.sendStatus(204);
        }
        else{
            onClientError(res, order_o.status_code, order_o.message);
        }
    }).catch(err => onServerError(res, err));
});

router.post("/cart", verifyAuth, (req, res)=>{
    orderDao.newOrderFromCart(req.user_id).then(order_o=>{
        if(order_o.success){
            res.status(200).json(order_o.order);
        }
        else{
            onClientError(res, order_o.status_code, order_o.message);
        }
    }).catch(err => onServerError(res, err));
});

module.exports = router;