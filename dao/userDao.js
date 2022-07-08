'use strict';

const User = require("../models/User");
const bcrypt = require('bcrypt');

function mHidePassword(user_in){

    let user = {
        "id":  user_in.id,
        "username": user_in.username,
        "admin": user_in.admin,
        "email": user_in.email,
        "name": user_in.name,
        "surname": user_in.surname,
    }

    return user;
}

async function allUsers(){
    let users = await User.findAll();
    return users.map(mHidePassword);
}

async function getUser(user_id){
    let user = await User.findByPk(user_id);
    if(user==null){
        return {
            "success": false,
            "status_code": 404,
            "message": `User with id ${user_id} not found.`,
        }
    }
    else{
        return {
            "success":true,
            "user": mHidePassword(user)
        }
    }
}

async function getUserByEmail(email){
    
    let user = await User.findOne({
        where:{
            "email":email,
        }
    });

    if(user==null){
        return {
            "success": false,
            "status_code": 404,
            "message": `User with id ${user_id} not found.`,
        }
    }
    else{
        return {
            "success":true,
            "user":mHidePassword(user)
        }
    }

}

async function isUsernameTaken(username) {
    let user = await User.findOne({
        where:{
            "username":username,
        }
    });

    if (user != null) {
        return true
    }
    return false
}

async function authenticateAndGetUser(username, password){
    let user = await User.findOne({
        where:{
            "username":username,
        }
    });
    if(user==null)return null;

    let success = await bcrypt.compare(password, user.password);
    return success ? mHidePassword(user) : null;
}


function isEmailValid(email) {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return email.match(validRegex); 
}


async function mParseJson(json_in, allow_admin=true){
    
    if(!json_in.hasOwnProperty("admin")){
        json_in.admin = false;
    }
    else if(typeof json_in.admin != "boolean"){
        return {
            "success":false,
            "status_code":400,
            "message": "'admin' field must be a boolean."
        }
    }

    const required_fields = ["username","password", "name", "surname", "email"]
    for(let f of required_fields){
        if(typeof json_in[f] != "string"){
            return {
                "success":false,
                "status_code":400,
                "message": `Required a string field ${f}`
            }
        }
    }

    if(!allow_admin&&json_in.admin){
        return {
            "success": false,
            "status_code":403,
            "message":`You are not allowed to create admin account this way.`
        }
    }

    if(await isUsernameTaken(json_in.username)){
        return {
            "success": false,
            "status_code": 409,
            "message": `This username is taken.`
        }
    }

    if(!isEmailValid(json_in.email)){
        return {
            "success": false,
            "status_code": 400,
            "message": `Incorrect email address: "${json_in.email}"`
        }
    }

    let hashed_password = await bcrypt.hash(json_in.password, 10);
    let user = {
        "username":json_in.username,
        "admin":json_in.admin,
        "password": hashed_password,
        "name": json_in.name,
        "surname": json_in.surname,
        "email": json_in.email
    };

    return {
        "success":true,
        "user":user
    }
}

async function postUser(json_in, allow_admin=true){
    let user_o = await mParseJson(json_in, allow_admin);
    if(!user_o.success) return user_o;
    
    let user = await User.build(user_o.user).save();

    return {
        "success": true,
        "user": mHidePassword(user)
    };
}

async function putUser(pk, json_in, allow_admin=true){
    let user_o = await mParseJson(json_in, allow_admin)
    if(!user_o.success) return user_o;

    user_o.user.id = pk

    const [user, created] = await User.upsert(user_o.user);

    return {
        "success": true,
        "user": mHidePassword(user),
        "created": created
    }
}

async function deleteUser(pk){
    let user_o = await getUser(pk);
    if(!user_o.success)return user_o;

    await User.destroy({
        where:{
            "id":pk
        }
    });

    return {
        "success":true
    }
}

module.exports = {
    allUsers,
    getUser,
    getUserByEmail,
    postUser,
    putUser,
    deleteUser,
    authenticateAndGetUser,
    isUsernameTaken,
    isEmailValid
}