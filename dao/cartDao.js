'use strict';
const productDao = require("./productDao");
const CartItem = require("../models/CartItem");

async function collectCartItemData(cart_item){
    const product_op = await productDao.getProduct(cart_item.product_id);
    if(!product_op.success)return product_op;
    const product = product_op.product;

    return {
        "success": true,
        "cart_item": {
            "id": cart_item.id,
            "product_id": cart_item.product_id,
            "product_name": cart_item.product_name,
            "quantity": cart_item.quantity,
            "total_price": cart_item.quantity * product.price,
            "picture_url": product.picture_url
        }
    }

}

async function allCartItemsByUserId(user_id){
    return CartItem.findAll({where:{user_id}});
}

async function clearCart(user_id){
    return CartItem.destroy({where:{user_id}});
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
        quantity = Number.parseInt(quantity);

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

    return {
        "success": true,
        "cart_item": ci
    }
}

async function setQuantity(pk, json_in){
    if(!json_in.hasOwnProperty("quantity")){
        return {
            "success": false,
            "status_code": 400,
            "message": `Integer field "quantity" required.`
        }
    }

    let quantity = Number.parseInt(json_in.quantity);
    if(Number.isNaN(quantity)){
        return {
            "success": false,
            "status_code": 400,
            "message": `Field "quantity" must be an integer.`
        }
    }

    let ci = await CartItem.findByPk(pk);
    if(ci!=null){
        return {
            "success": false,
            "status_code": 404,
            "message": `CartItem with pk: ${pk} not found`
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
        return {
            "success": true,
            "status_code": 204,
            "cart_item": null
        }
    }
    else{
        ci.quantity = quantity;
        ci = await ci.save();

        return {
            "success": true,
            "status_code": 200,
            "cart_item": ci
        }
    }
}

module.exports = {
    allCartItemsByUserId,
    clearCart,
    addProductToCart,
    setQuantity
}