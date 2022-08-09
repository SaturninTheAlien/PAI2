'use strict';

const Category = require("../models/Category");

async function allCategories(){
    return Category.findAll();
}

async function getCategoriesOnMainPage(){
    return Category.findAll({where:{
        "on_main_page":true
    }});
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

function validateProductAttribute(a, v){
    
    if(v==null){
        return false;
    }

    function exceedsMinMaxValues(){
        return (a.max!=null && v > max) || (a.min!=null && v < min);
    }
   
    switch(a.type){

    case "string":
        return typeof v == 'string'

    case "date":
    case "int":
        return Number.isInteger(v) && !exceedsMinMaxValues();

    case "unint":
        if(!Number.isInteger(v))return false;
        return v>=0 && !exceedsMinMaxValues();

    case "float":
        return !Number.isNaN(v) && !exceedsMinMaxValues()

    case "enum":
        return a.values.includes(v);
    }

    return false;
}

function parseCategoryInput(json_in){

    if(typeof json_in.name != "string"){
        return {
            "success":false,
            "status_code":400,
            "message": `String field "name" required.`
        }
    }

    if(!Array.isArray(json_in.attributes)){
        json_in.attributes = [];
    }

    if(!json_in.hasOwnProperty("parent_id")){
        json_in.parent_id = null;
    }


    for(let a of json_in.attributes){
        if(typeof a.name != "string"){
            return {
                "success":false,
                "status_code":400,
                "message": `Incorrect attribute, string field "name" required.`
            }
        }

        if(typeof a.type != "string"){
            return {
                "success":false,
                "status_code":400,
                "message": `Incorrect attribute: ${a.name}, field "type" required.`
            }
        }

        if(a.type=="enum"){
            if(!Array.isArray(a.values)){
                return {
                    "success":false,
                    "status_code":400,
                    "message": `Incorrect attribute: ${a.name}, field "values" required for enum type.`
                }
            }
        }

        else if(a.hasOwnProperty("default") && !validateProductAttribute(a, a.default)){
            return {
                "success": false,
                "status_code": 400,
                "message": `Incorrect attribute: ${a.name}, incorrect default value: "${a.default}".`
            }
        }

        else if(a.hasOwnProperty("max") && !validateProductAttribute(a, a.max)){
            return {
                "success": false,
                "status_code": 400,
                "message": `Incorrect attribute: ${a.name}, incorrect max value: "${a.max}".`
            }
        }

        else if(a.hasOwnProperty("min") && !validateProductAttribute(a, a.min)){
            return {
                "success": false,
                "status_code": 400,
                "message": `Incorrect attribute: ${a.name}, incorrect min value: "${a.min}".`
            }
        }

        
    }
    return {
        "success": true,
        "category": {
            "name": json_in.name,
            "parent_id": json_in.parent_id,
            "attributes": json_in.attributes,
            "on_main_page": json_in.on_main_page || false,
            "abstract": json_in.abstract || false
        }
    }
}

async function postCategory(json_in){
    let category_o = parseCategoryInput(json_in);
    if(!category_o.success) return category_o;

    let category = await Category.create(category_o.category);

    return {
        "success": true,
        "category": category
    }
}

async function putCategory(pk, json_in){
    let category_o = parseCategoryInput(json_in);
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

    async function rec2(level, category, arr, child_id=null){
        //prevent infinite loop
        if(arr.find(a => a.category.id == category.id) == null){
            arr = [...arr, {
                "category": category,
                "child_id": child_id,
                "level" : level
            }];

            if(category.parent_id!=null){
                let op = await getCategory(category.parent_id);
                if(op.success){
                    arr = await rec2(level-1, op.category, arr, category.id);
                }
            }
        }
        return arr;
    }

    return {
        "success":true,
        "categories": await rec2(0, root_o.category, []),
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

async function collectCategoryData(pk){
    function f1(category_in){
        return {
            "id": category_in.id,
            "name": category_in.name,
            "abstract": category_in.abstract,
            "selected": false
        }
    }

    let categories_on_main_page = await getCategoriesOnMainPage();
    categories_on_main_page = categories_on_main_page.map(f1);

    let parents_op = await getCategoryWithAllParents(pk);
    if(!parents_op.success)return parents_op;
    let parents = parents_op.categories;
    for(let parent of parents){

        let x = categories_on_main_page.find(a=>a.id==parent.category.id);
        if(x!=null){
            let p = parent;
            while(true){
                let children = await Category.findAll({
                    where:{
                        "parent_id": x.id
                    }
                });
                x.children = children.map(f1);

                x.selected = true                
                if(x.id==pk)break;

                p = parents.find(a=>a.category.parent_id == x.id);
                x = x.children.find(a=>a.id == p.category.id);
                
            }                
            break;
        }
    }

    let category = parents[0].category;
    return {
        "success": true,
        "res": {
            "category":{
                "id": category.id,
                "name": category.name,
                "on_main_page": category.on_main_page,
            },
            
            "tree": categories_on_main_page,
            "all_attributes": parents.map(a => {return a.category.attributes}).flat()
        }
    }
}

module.exports = {
    allCategories,
    getCategory,
    postCategory,
    putCategory,
    deleteCategory,


    getCategoriesOnMainPage,
    getCategoryWithAllChildren,
    getCategoryWithAllParents,
    collectAllCategoryAttributes,
    validateProductAttribute,
    collectCategoryData
}