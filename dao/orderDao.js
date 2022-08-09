'use strict';

const Order = require("../models/Order");
const cartDao = require("./cartDao");


async function allOrders(){
    return Order.findAll();
}

async function allOrdersByUser(user_id){
    return Order.findAll({where: {user_id}});
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
            "order": order
        }
    }
}

async function completeOrder(pk){
    let order_o = await getOrder(pk);
    if(!order_o.success)return order_o;

    let order = order_o.order;
    order.completed = true;
    await order.save();
}

async function buyCartItems(user_id, shipping_method){
    let cart = await cartDao.getCart(user_id);
    let order = {
        user_id,
        shipping_method,
        "contents": cart.contents,
        "price_control_field": cart.total_cost
    }

    return Order.create(order);
}


module.exports = {
    allOrders,
    allOrdersByUser,
    getOrder,
    completeOrder,
    buyCartItems,
}