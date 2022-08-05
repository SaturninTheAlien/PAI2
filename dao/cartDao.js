'use strict';
const productDao = require("./productDao");
const CartItem = require("../models/CartItem");

const {formatPLN} = require("../utils/priceUtils");

async function collectCartItemData(cart_item){

    const product_op = await productDao.getProduct(cart_item.product_id);
    if(!product_op.success)return {
        "id": cart_item.id,
        "product_id": null,
        "product_name": "Missing product",
        "quantity": cart_item.quantity,
        "total_price": null,
        "total_price_pln": null,
        "picture_url": null
    }
    const product = product_op.product;
    let total_price = cart_item.quantity * product.price;

    return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "product_name": product.name,
        "quantity": cart_item.quantity,
        "total_price": total_price,
        "total_price_pln":  formatPLN(total_price),
        "picture_url": product.picture_url
    }
}    

async function getCart(user_id){
    const cart = await Promise.all((await CartItem.findAll({where:{user_id}})).map(collectCartItemData));

    const total_price = cart.length==0 ? 0 : cart.map(ci=>ci.total_price).reduce((a,b)=>a+b);
    return {
        "cart": cart,
        "total_price": total_price,
        "total_price_pln": formatPLN(total_price) 
    }
}

async function clearCart(user_id){
    await CartItem.destroy({where:{user_id}});
    return {
        "cart": [],
        "total_price": 0,
        "total_price_pln": "0,00 zł"
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
        ci = await ci.save();
    }
    else{
        ci = await CartItem.create({user_id, product_id, quantity});
    }

    let cart = await getCart(user_id);
    cart.cart_item = await collectCartItemData(ci);

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
    cart.cart_item = await collectCartItemData(ci);

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