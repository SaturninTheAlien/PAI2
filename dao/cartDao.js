'use strict';
const productDao = require("./productDao");
const CartItem = require("../models/CartItem");

const {formatPLN} = require("../utils/priceUtils");

async function collectCartItemData(cart_item){

    const product_op = await productDao.getProduct(cart_item.product_id);
    if(!product_op.success)return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "product": null,
        "quantity": cart_item.quantity,
        "total_cost": null,
        "total_cost_pln": null,
    }
    const product = product_op.product;
    let total_cost = cart_item.quantity * product.price;

    return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "product": product,
        "quantity": cart_item.quantity,
        "total_cost": total_cost,
        "total_cost_pln":  formatPLN(total_cost),
    }
}    

async function getCart(user_id){
    const cart = await Promise.all((await CartItem.findAll({where:{user_id}})).map(collectCartItemData));

    const total_cost = cart.length==0 ? 0 : cart.map(ci=>ci.total_cost).reduce((a,b)=>a+b);
    return {
        "contents": cart,
        "total_cost": total_cost,
        "total_cost_pln": formatPLN(total_cost) 
    }
}

async function clearCart(user_id){
    await CartItem.destroy({where:{user_id}});
    return {
        "contents": [],
        "total_cost": 0,
        "total_cost_pln": "0,00 zł"
    }
}

async function addProductToCart(user_id, json_in){
    if(!json_in.hasOwnProperty("product_id")){
        return {
            "success": false,
            "status_code": 400,
            "message": `Integer field "product_id" required.`
        }
    }

    const product_id = json_in.product_id;
    let quantity = 1;
    if(json_in.hasOwnProperty("quantity")){
        quantity = Number.parseInt(json_in.quantity);

        if(Number.isNaN(quantity)){
            return {
                "success": false,
                "status_code": 400,
                "message": `Field "quantity" must be an integer.`
            }
        }

        if(quantity<=0){
            return {
                "success": false,
                "status_code": 400,
                "message": "Quantity cannot be 0 or negative."
            }
        }
    }

    let ci = await CartItem.findOne({where:{user_id, product_id}});
    if(ci!=null){
        ci.quantity += quantity;
        await ci.save();
    }
    else{
        await CartItem.create({user_id, product_id, quantity});
    }

    let cart = await getCart(user_id);

    return {
        "success": true,
        "cart": cart
    }
}

async function getCartItem(pk, user_id){
    let ci = await CartItem.findByPk(pk);
    if(ci==null){
        return {
            "success": false,
            "status_code": 404,
            "message": `CartItem with pk: ${pk} not found`
        }
    }
    else if(ci.user_id!=user_id && user_id!=null ){
        return {
            "success": false,
            "status_code": 403,
            "message": `You cannot modify the content of another user's cart.`
        }
    }
    else{
        return {
            "success": true,
            "cart_item": ci
        }
    }
}

async function setQuantity(pk, json_in, user_id){
    if(!json_in.hasOwnProperty("quantity")){
        return {
            "success": false,
            "status_code": 400,
            "message": `Integer field "quantity" required.`
        }
    }

    let ci_o = await getCartItem(pk, user_id);
    if(!ci_o.success)return ci_o;

    let ci = ci_o.cart_item;

    let quantity = Number.parseInt(json_in.quantity);
    if(Number.isNaN(quantity)){
        return {
            "success": false,
            "status_code": 400,
            "message": `Field "quantity" must be an integer.`
        }
    }

    if(quantity<0){
        return {
            "success": false,
            "status_code": 400,
            "message": "Quantity cannot be negative, use 0 if you want to remove product from the cart."
        }
    }
    else if(quantity==0){
        await ci.destroy();
    }
    else{
        ci.quantity = quantity;
        ci = await ci.save();
    }

    let cart = await getCart(user_id);

    return {
        "success": true,
        "cart": cart
    }
}

async function deleteCartItem(pk, user_id){
    let ci_o = await getCartItem(pk, user_id);
    if(!ci_o.success)return ci_o;

    await ci_o.cart_item.destroy();

    return {
        "success": true,
        "cart": await getCart(user_id)
    }
}

module.exports = {
    getCart,
    clearCart,
    addProductToCart,
    setQuantity,
    deleteCartItem
}