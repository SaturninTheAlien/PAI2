'use strict';

const Category = require("../models/Category");

async function allCategories(){
    return await Category.findAll();
}

async function getCategory(pk){
    let res =  await Category.findByPk(pk);
    if(res==null){
        return {
            "success": false,
            "status_code": 404,
            "message": `Category with id ${pk} not found.`,
        }
    }
    else{
        return {
            "success": true,
            "category": res
        }
    }
}

function mParseJson(json_in){
    const required_fields = ["name", "attributes"]
    for(let f of required_fields){
        if(!json_in.hasOwnProperty(f)){
            return {
                "success":false,
                "status_code":400,
                "message": `Field "${f}" required.`
            }
        }
    }
    
    if(!Array.isArray(json_in.attributes)){
        return {
            "success":false,
            "status_code":400,
            "message": `Field "attributes" must be an array.`
        }
    }

    if(!json_in.hasOwnProperty("parent_id")){
        json_in.parent_id = null;
    }

    const required_fields_for_attribute = ["name", "type"]
    for(let a of json_in.attributes){
        for(let f of required_fields_for_attribute){
            if(!a.hasOwnProperty(f)){
                return {
                    "success":false,
                    "status_code":400,
                    "message": `Anorrect attribute, field "${f}" required.`
                }
            }
        }
    }
    return {
        "success": true,
        "category": {
            "name": json_in.name,
            "parent_id": json_in.parent_id,
            "attributes": json_in.attributes
        }
    }
}

async function postCategory(json_in){
    let category_o = mParseJson(json_in);
    if(!category_o.success) return category_o;

    let category = await Category.build(category_o.category).save();

    return {
        "success": true,
        "category": category
    }
}

async function putCategory(pk, json_in){
    let category_o = mParseJson(json_in);
    if(!category_o.success) return category_o;

    category_o.category.id = pk;

    const [category, created] = await Category.upsert(category_o.category);

    return {
        "success": true,
        "category": category,
        "created": created
    }
}

async function deleteCategory(pk){
    let category_o = await getCategory(pk);
    if(!category_o.success) return category_o;

    await Category.update(
        {parent_id: null},
        {where: {parent_id : pk}}
    );

    await category_o.category.destroy();

    return {
        "success": true
    }
}

async function getCategoryWithAllChildren(pk){
    let root_o = await getCategory(pk);
    if(!root_o.success) return root_o;

    async function rec1(level, category, arr){

        //prevent infinite loop
        if(arr.find(a => a.category.id == category.id) == null){

            arr = [...arr, {
                "category": category,
                "level" : level
            }];

            let children = await Category.findAll({
                where:{
                    "parent_id": category.id
                }
            });

            for(let childCategory of children){
                arr = await rec1(level+1, childCategory, arr);
            }
        }

        return arr;
    }


    return {
        "success":true,
        "categories": await rec1(0, root_o.category, []),
    };
}

async function getCategoryWithAllParents(pk){
    let root_o = await getCategory(pk);
    if(!root_o.success) return root_o;

    async function rec1(level, category, arr){
        //prevent infinite loop
        if(arr.find(a => a.category.id == category.id) == null){
            arr = [...arr, {
                "category": category,
                "level" : level
            }];

            if(category.parent_id!=null){
                let op = await getCategory(category.parent_id);
                if(op.success){
                    arr = await rec1(level-1, op.category, arr);
                }
            }
        }
        return arr;
    }

    return {
        "success":true,
        "categories": await rec1(0, root_o.category, []),
    }
}


async function collectAllCategoryAttributes(pk){
    let op = await getCategoryWithAllParents(pk);
    if(!op.success) return op;

    return {
        "success": true,
        "attributes": op.categories.map(a => {return a.category.attributes}).flat()
    }
}


module.exports = {
    allCategories,
    getCategory,
    postCategory,
    putCategory,
    deleteCategory,

    getCategoryWithAllChildren,
    getCategoryWithAllParents,
    collectAllCategoryAttributes,
}