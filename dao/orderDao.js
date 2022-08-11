'use strict';

const Order = require("../models/Order");
const cartDao = require("./cartDao");

const stripe = require("../config/stripe");

async function updateOrderPaidStatus(order){
    if(!order.paid && order.payment_intent_id!=null){
        let payment_intent = await stripe.paymentIntents.retrieve(order.payment_intent_id);

        if(payment_intent.status === "succeeded"){
            order.paid = true;
            order = await order.save();
        }
    }
    return order;
}

async function allOrders(){
    return Promise.all((await Order.findAll()).map(updateOrderPaidStatus));
}

async function allOrdersByUser(user_id){
    return Promise.all((await Order.findAll({where: {user_id}})).map(updateOrderPaidStatus));
}

async function getOrder(pk){
    let order = await Order.findByPk(pk);
    if(order==null){
        return {
            "success": false,
            "status_code": 404,
            "message": `Order with id ${pk} not found`
        }
    }
    else{
        return {
            "success": true,
            "order": await updateOrderPaidStatus(order)
        }
    }
}

async function newOrderFromCart(user_id){
    let cart = await cartDao.getCart(user_id);

    if(cart.contents.length==0){
        return {
            "success": false,
            "status_code": 409,
            "message": `Your cart is empty, cannot create an empty order.`
        }
    }
    else if(cart.total_cost<=0){
        return {
            "success": false,
            "status_code": 409,
            "message": "You cannot create an order with a price 0 or negative."
        }
    }

    
    let payment_intent = await stripe.paymentIntents.create({
        currency: "PLN",
        amount: cart.total_cost,
        automatic_payment_methods: { enabled: true }
    });

    if(payment_intent.amount!=cart.total_cost){
        return {
            "success": false,
            "status_code": 500,
            "message": `Incorrect price in payment intent.`
        }
    }

    let order = await Order.create({
        user_id,
        shipping_method,
        "contents": cart.contents,
        "total_cost": cart.total_cost,
        "payment_intent_id": payment_intent.id,
    });


    return {
        "success": true,
        "order": order
    };
}


module.exports = {
    allOrders,
    allOrdersByUser,
    getOrder,
    newOrderFromCart
}