'use strict';

const categoryDao = require("./categoryDao");
const Product = require("../models/Product");

const {formatPLN} = require("../utils/priceUtils");


function collectProductData(product){
    return {
        "id": product.id,
        "name": product.name,
        "category_id": product.category_id,
        "price": product.price,
        "price_pln": formatPLN(product.price),
        "description": product.description,
        "picture_url": product.picture_url,
        "attributes": product.attributes
    }
}

async function allProducts(){
    return (await Product.findAll()).map(collectProductData);
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
        "products": products.map(collectProductData)
    }
}

async function getProduct(pk){
    let product =  await Product.findByPk(pk);
    if(product==null){
        return {
            "success": false,
            "status_code": 404,
            "message": `Product with id ${pk} not found.`,
        }
    }
    else{
        return {
            "success": true,
            "product": collectProductData(product)
        }
    }
}

async function parseProductInput(json_in){
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

    const categoryData_o = await categoryDao.collectCategoryData(product.category_id);
    if(!categoryData_o.success) return categoryData_o;

    const categoryData = categoryData_o.res;
    if(categoryData.category.abstract){
        return {
            "success": false,
            "status_code": 409,
            "message": `Cannot assign product to abstract category: ${categoryData.category.name}, use child category instead!`
        }
    }

    const attributes = categoryData.all_attributes;
    
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
        else if(!a.default_value!=null){
            product.attributes[a.name] = a.default_value;
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
    let op = await parseProductInput(json_in);
    if(!op.success) return op;

    const product = await Product.create(op.product);
    
    return {
        "success": true,
        "product": collectProductData(product)
    }
}

async function putProduct(pk, json_in){
    let op = await parseProductInput(json_in);
    if(!op.success) return op;
    op.product.id = pk

    const [product, created] = await Product.upsert(op.product);

    return {
        "success": true,
        "product": collectProductData(product),
        "created": created
    }

}

async function deleteProduct(pk){
    let op = await getProduct(pk);
    if(!op.success) return op;

    await Product.destroy({where: {id: pk}});

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