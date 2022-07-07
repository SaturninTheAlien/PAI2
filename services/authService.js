'use strict';

const{onClientError} = require("../handlers/errorHandler");

const {JWT_SECRET} = require("../config/env")

const jwt = require('jsonwebtoken')
const userDao = require("../dao/userDao");

async function verifyBasicAuth(req, b64auth){
    //const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const strauth = Buffer.from(b64auth, 'base64').toString();

    if(strauth==null || strauth=="")return false;
    const splitIndex = strauth.indexOf(':');

    const login = strauth.substring(0, splitIndex);
    const password = strauth.substring(splitIndex + 1);

    const user = await userDao.authenticateAndGetUser(login, password);
    if(user==null) return false;

    req.user_id = user.id;
    req.user_login = user.username;
    req.user_admin = user.admin;
    
    return true;
}

function mVerifyAuth(req, res, next, admin_perm_required=false) {

    function n1(){
        if(admin_perm_required && !req.user_admin){
            onClientError(res, 403, "Only admin user can do this.");
        }
        else{
            next();
        }
    }
    const authHeaderA = (req.headers.authorization || '').split(' ')
    if(authHeaderA.length < 2){
        onClientError(res, 401, "Authentication required.");
        return;
    }

    const method = authHeaderA[0];
    const auth = authHeaderA[1];

    if(method=="Bearer" || method=="Token"){
        jwt.verify(auth, JWT_SECRET, (err, data) => {
            if(err) {
                onClientError(res, 401, "Incorrect or expired token.");

            } else {
                req.user_login = data.username;
                req.user_id = data.id;
                req.user_admin = data.admin;
                n1();
            }
        });
    }
    else if(method=="Basic"){
        verifyBasicAuth(req, auth).then(a => {
            if(a){
                n1();
            }
            else{
                onClientError(res, 401, "Incorrect authentication.");
            }
        });
    }
    else{
        onClientError(res, 401, "Unsupported authentication method.");
    }
}


function verifyAuth(req, res, next){
    mVerifyAuth(req, res, next, false);
}

function verifyAuthAdmin(req, res, next){
    mVerifyAuth(req, res, next, true);
}

function generateToken(user) {
    const {username, id, admin} = user
    return jwt.sign({username, id, admin}, JWT_SECRET)
}

async function login(json_data){
    
    if(!json_data.hasOwnProperty("username")){
        return {
            "success": false,
            "status_code": 400,
            "message": "'username' field required."
        }
    }
    if(!json_data.hasOwnProperty("password")){
        return {
            "success": false,
            "status_code": 400,
            "message": "'password' field required."
        }
    }
    let user = await userDao.authenticateAndGetUser(json_data.username, json_data.password);
    if(user==null){
        return {
            "success": false,
            "status_code": 401,
            "message":"Incorrect login or password."
        }
    }
    else{
        return {
            "success": true,
            "token": generateToken(user),
            "user": user
        }
    }
}

module.exports = {
    verifyAuth,
    verifyAuthAdmin,
    generateToken,
    login
}