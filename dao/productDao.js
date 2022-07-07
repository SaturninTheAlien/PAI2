'use strict';

const categoryDao = require("./categoryDao");
const Product = require("../models/Product");

async function allProducts(){
    return await Product.findAll();
}

async function getProduct(pk){
    let op =  await Product.findByPk(pk);
    if(op==null){
        return {
            "success": false,
            "status_code": 404,
            "message": `Product with id ${pk} not found.`,
        }
    }
    else{
        return {
            "success": true,
            "product": op
        }
    }
}

async function mParseProductJson(json_in){
    let product = new Object();
    
    const required_fields = ["name", "attributes", "category_id", "price"];
    for(let f of required_fields){
        if(!json_in.hasOwnProperty(f)){
            return {
                "success":false,
                "status_code":400,
                "message": `Field "${f}" required.`
            }
        }
        product[f] = json_in[f];
    }

    product.category_id = Number.parseInt(product.category_id);
    if(Number.isNaN(product.category_id)){
        return {
            "success":false,
            "status_code":400,
            "message": `Field "category_id" must be an integer.`
        }
    }

    const category_o =  await categoryDao.getCategory(product.category_id);
    if(!category_o.success) return category_o;

    /*const category = category_o.category;
    for(let a of category.attributes){
        if(!product.attributes.hasOwnProperty())
    }*/   

    const optional_fields=["description", "picture_url"];
    for(let f of optional_fields){
        if(json_in.hasOwnProperty(f)){
            product[f] = json_in[f];
        }
        else{
            product[f] = null;
        }
    }

    return {
        "success": true,
        "product": product
    }
}

async function postProduct(json_in){
    let op = await mParseProductJson(json_in);
    if(!op.success) return op;

    const product = await Product.build(o.product).save();
    
    return {
        "success": true,
        "product": product
    }
}

async function putProduct(pk, json_in){
    let op = await mParseProductJson(json_in);
    if(!op.success) return op;
    op.product.id = pk

    const [product, created] = await Product.upsert(o.product);

    return {
        "success": true,
        "product": product,
        "created": created
    }

}

async function deleteProduct(pk){
    let op = await getProduct(pk);
    if(!op.success) return op;

    await op.product.destroy();

    return {
        "success": true
    }
}


module.exports = {
    allProducts,
    getProduct,
    postProduct,
    putProduct,
    deleteProduct
}