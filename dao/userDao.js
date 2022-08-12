'use strict';

const User = require("../models/User");
const bcrypt = require('bcrypt');

function mHidePassword(user_in){
    return {
        "id":  user_in.id,
        "username": user_in.username,
        "email": user_in.email,
        "admin": user_in.admin,
        
        "nickname": user_in.nickname,
        "picture": user_in.picture,
        "given_name": user_in.given_name,
        "family_name": user_in.family_name,
    }
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
    return user!=null;
}

async function isEmailTaken(email) {
    let user = await User.findOne({
        where:{
            "email":email,
        }
    });
    return user!=null;
}

async function authenticateAndGetUser(username, password){
    let user = await User.findOne({
        where:{
            "username":username,
        }
    });
    if(user==null || user.password==null)return null;

    let success = await bcrypt.compare(password, user.password);
    return success ? mHidePassword(user) : null;
}

async function loginWithGoogleAndGetUser(googleUserInfo){
    let user = await User.findOne({
        where:{
            "google_id": googleUserInfo.id
        }
    });

    if(user!=null){
        if(user.picture!=googleUserInfo.picture){
            user.picture = googleUserInfo.picture;
            user = await user.save();
        }

        return {
            "success":true,
            "user": mHidePassword(user)
        };
    }
    if(!googleUserInfo.verified_email){
        return {
            "success":false,
            "status_code": 401,
            "message": `Unable to sign in with Google because of unverified email.`
        }
    }
    
    user = await User.findOne({
        where:{
            "email": googleUserInfo.email
        }
    });

    if(user!=null){
        user.google_id = googleUserInfo.id;

        if(user.given_name==null){
            user.given_name = googleUserInfo.given_name;
        }
        if(user.family_name==null){
            user.family_name = googleUserInfo.family_name;
        }
        if(user.picture==null){
            user.picture = googleUserInfo.picture;
        }
    }
    else{
        user = User.build({
            "nickname": googleUserInfo.name,
            "email": googleUserInfo.email,
            "picture": googleUserInfo.picture,
            "given_name": googleUserInfo.given_name,
            "family_name": googleUserInfo.family_name,        
            "google_id": googleUserInfo.id
        });
    }

    user = await user.save();
    return {
        "success":true,
        "user": mHidePassword(user)
    };
}

function isEmailValid(email) {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return email.match(validRegex); 
}


async function parseUserInput(json_in, allow_admin=true){
    
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

    const required_fields = ["username","password", "given_name", "family_name", "email"]
    for(let f of required_fields){
        if(typeof json_in[f] != "string"){
            return {
                "success":false,
                "status_code":400,
                "message": `Required a string field ${f}`
            }
        }
    }

    if(typeof json_in.nickname != "string"){
        json_in.nickname = json_in.username;
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

    if(await isEmailTaken(json_in.email)){
        return {
            "success": false,
            "status_code": 409,
            "message": `This email is already taken.`
        }
    }

    let hashed_password = await bcrypt.hash(json_in.password, 10);
    let user = {
        "nickname": json_in.nickname,

        "username":json_in.username,
        "password": hashed_password,
        "admin":json_in.admin,
        "picture": json_in.picture,
        
        "given_name": json_in.given_name,
        "family_name": json_in.family_name,
        "email": json_in.email
    };

    return {
        "success":true,
        "user":user
    }
}

async function postUser(json_in, allow_admin=true){
    let user_o = await parseUserInput(json_in, allow_admin);
    if(!user_o.success) return user_o;
    
    let user = await User.create(user_o.user);

    return {
        "success": true,
        "user": mHidePassword(user)
    };
}

async function putUser(pk, json_in, allow_admin=true){
    let user_o = await parseUserInput(json_in, allow_admin)
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
    loginWithGoogleAndGetUser,
    isUsernameTaken,
    isEmailValid,
    isEmailTaken
}