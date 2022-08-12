'use strict';

const Order = require("../models/Order");

const productDao = require("./productDao");
const cartDao = require("./cartDao");
const stripe = require("../config/stripe");

const {formatPLN} = require("../utils/priceUtils");

async function collectOrderData(order){

    async function f1(a){
        let quantity = a.quantity;
        let product = null;
        if(a.product_id!=null){
            let product_o = await productDao.getProduct(a.product_id);
            if(product_o.success){
                product = product_o.product;
            }
        }
        return {quantity, product};
    }

    let {id, user_id, contents, total_cost, paid, ts, payment_client_secret} = order;
    contents = await Promise.all(contents.map(f1));

    let total_cost_pln = formatPLN(total_cost);
    
    return {id, user_id, contents, total_cost, total_cost_pln, paid, ts, payment_client_secret};    
}

async function updateOrderPaidStatus(order){
    if(!order.paid && order.payment_intent_id!=null){
        let payment_intent = await stripe.paymentIntents.retrieve(order.payment_intent_id);

        if(payment_intent.status === "succeeded"){
            order.paid = true;
            order = await order.save();
        }
    }
    return collectOrderData(order);
}

async function allOrders(){
    return Promise.all((await Order.findAll()).map(updateOrderPaidStatus));
}

async function allOrdersByUser(user_id){
    return Promise.all((await Order.findAll({where: {user_id}})).map(updateOrderPaidStatus));
}

async function getOrder(pk, user_id, user_admin=false){
    let order = await Order.findByPk(pk);
    if(order==null){
        return {
            "success": false,
            "status_code": 404,
            "message": `Order with id ${pk} not found`
        }
    }
    else if(!user_admin && order.user_id!=user_id){
        return {
            "success": false,
            "status_code": 403,
            "message": `You have no permission to access this order.`
        }
    }
    else{
        return {
            "success": true,
            "order": await updateOrderPaidStatus(order)
        }
    }
}

async function cancelOrder(pk, user_id, user_admin=false){
    let order_o = await getOrder(pk, user_id, user_admin);
    if(!order_o.success) return order_o;
    let order = order_o.order;

    if(order.paid){
        return {
            "success": false,
            "status_code": 409,
            "message": `Cannot cancel already paid order`
        }
    }
    else{

        if(order.payment_intent_id!=null){
            await stripe.paymentIntents.cancel(order.payment_intent_id);
        }

        await Order.destroy({where:{id:pk}});

        return {
            "success": true
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

    let contents = cart.contents.map(a=>{
        return {
            "product_id": a.product_id,
            "quantity": a.quantity
        }
    });

    let order = await Order.create({
        user_id,
        contents,
        "total_cost": cart.total_cost,
        "payment_intent_id": payment_intent.id,
        "payment_client_secret": payment_intent.client_secret,
        "ts": Date.now()
    });
    return {
        "success": true,
        "order": await collectOrderData(order)
    };
}


module.exports = {
    allOrders,
    allOrdersByUser,
    getOrder,
    newOrderFromCart,
    cancelOrder
}