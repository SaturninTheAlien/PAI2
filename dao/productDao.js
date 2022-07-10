'use strict';

const categoryDao = require("./categoryDao");
const Product = require("../models/Product");

async function allProducts(){
    return await Product.findAll();
}


function validateProductAttributeQuery(a, v){
    if(a.type=="int" || a.type=="date" || a.type == "uint"){
        v = Number.parseInt(v);
    }
    else if(a.type=="float"){
        v = Number.parseFloat(v)
    }

    return categoryDao.validateProductAttribute(a, v);
}

function validateProductAttributeQueryMinMax(a, v){
    if(a.type=="string" || a.type == "enum") return false;
    return validateProductAttributeQuery(a,v);
}



async function allProductsByCategory(category_id, exlude_children, query){
    let products;
    let attributes;
    if(exlude_children){
        products = await Product.findAll({
            where:{
                "category_id": category_id
            }
        });
        let category_o = await categoryDao.getCategory(category_id);
        if(!category_o.success)return category_o;
        attributes = category_o.category.attributes;

    }
    else{
        let op = await categoryDao.getCategoryWithAllChildren(category_id);
        if(!op.success)return op;
        let categoryIDs = op.categories.map(a=>a.category.id);
        
        products = await Product.findAll({
            where:{
                "category_id": categoryIDs
            }
        });

        let attributes_o = await categoryDao.collectAllCategoryAttributes(category_id);
        if(!attributes_o.success) return attributes_o;

        attributes = attributes_o.attributes;
    }

    for(let a of attributes){
        let attr_value = query[a.name];

        if(attr_value!=null){
            if(!validateProductAttributeQuery(a, attr_value)){
                return {
                    "success": false,
                    "status_code": 400,
                    "message": `Incorrect value: ${attr_value} of: ${a.name}.`
                }
            }
            products = products.filter(product=>{
                return product.attributes[a.name] == attr_value
            });
        }

        attr_value = query[a.name+"_min"];
        if(attr_value!=null){
            if(!validateProductAttributeQueryMinMax(a, attr_value)){
                return {
                    "success": false,
                    "status_code": 400,
                    "message": `Incorrect value: ${attr_value} of: ${a.name}_min.`
                }
            }
            products = products.filter(product=>{
                return product.attributes[a.name] >= attr_value
            });
        }

        attr_value = query[a.name+"_max"];
        if(attr_value!=null){
            if(!validateProductAttributeQueryMinMax(a, attr_value)){
                return {
                    "success": false,
                    "status_code": 400,
                    "message": `Incorrect value: ${attr_value} of: ${a.name}_max.`
                }
            }
            products = products.filter(product=>{
                return product.attributes[a.name] <= attr_value
            });
        }
    }

    return {
        "success": true,
        "products": products
    }
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
    if(typeof json_in.name != "string"){
        return {
            "success":false,
            "status_code":400,
            "message": `String field "name" required.`
        }
    }
    if(!Number.isInteger(json_in.category_id)){
        return {
            "success":false,
            "status_code":400,
            "message": `Integer field "category_id" required.`
        }
    }

    if(!Number.isInteger(json_in.price)){
        return {
            "success":false,
            "status_code":400,
            "message": `Integer field "price" required.`
        }
    }

    let product = {
        "name": json_in.name,
        "attributes": json_in.attributes || new Object(),
        "category_id": json_in.category_id,
        "price" : json_in.price,
        "description" : json_in.description || null,
        "picture_url": json_in.picture_url || null,
    }
    
    
    const attributes_o = await categoryDao.collectAllCategoryAttributes(product.category_id);
    if(!attributes_o.success) return attributes_o;
    
    const attributes = attributes_o.attributes;
    for(let a of attributes){
        if(product.attributes[a.name]!=null){
            if(!categoryDao.validateProductAttribute(a, product.attributes[a.name])){
                return {
                    "success": false,
                    "status_code": 400,
                    "message": `Not allowed value ${product.attributes[a.name]} of the attribute "${a.name}"`
                }
            }
        }
        else if(!a.allow_null){
            return {
                "success":false,
                "status_code": 400,
                "message": `Missing attribute: ${a.name}`
            }
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

    const [product, created] = await Product.upsert(op.product);

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
    allProductsByCategory,
    getProduct,
    postProduct,
    putProduct,
    deleteProduct
}