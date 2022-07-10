'use strict';

const axios = require("axios");
const env = require("../config/env");
const userDao = require("../dao/userDao");
const {generateToken} = require("./authService");

function getRedirectUrl(state_url=null){
    if(env.GOOGLE_CLIENT_ID==null || env.GOOGLE_CLIENT_SECRET==null) return null;
    
    let params = new URLSearchParams({
        "client_id": env.GOOGLE_CLIENT_ID,
        "redirect_uri": env.GOOGLE_CLIENT_REDIRECT_URI,
        "response_type": "code",
        "scope": [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ].join(" ")
    });

    if(state_url!=null){
        const isValidUrl = urlString=> {
            try { 
                return Boolean(new URL(urlString)); 
            }
            catch(e){ 
                return false; 
            }
        }
        if(isValidUrl(state_url)){
            params.set("state", state_url);
        }
    }

    return "https://accounts.google.com/o/oauth2/auth?"+params.toString();
}

async function getAccessToken(code){
    if(env.GOOGLE_CLIENT_ID==null || env.GOOGLE_CLIENT_SECRET==null || code==null) return null;

    let params = new URLSearchParams({
        "client_id": env.GOOGLE_CLIENT_ID,
        "client_secret": env.GOOGLE_CLIENT_SECRET,
        "code": code,
        "redirect_uri": env.GOOGLE_CLIENT_REDIRECT_URI,
        "grant_type":"authorization_code"
    });   

    let response = await axios({
        method: "POST",
        url: "https://accounts.google.com/o/oauth2/token?" + params.toString(),
        headers: {
          Accept: "application/json",
        },
    });   
    return response.data.access_token;
}


async function login(code){
    const access_token = await getAccessToken(code);
    if(access_token==null) return {
        "success": false,
        "status_code": 401,
        "message": "Unable to obtain access token."
    }

    const google_user_info = await axios({
        method: "GET",
        url: "https://www.googleapis.com/oauth2/v2/userinfo",
        headers: {
            "Authorization": `Bearer ${access_token}`
        }
    });

    let user_o = await userDao.loginWithGoogleAndGetUser(google_user_info.data);
    if(!user_o.success)return user_o;

    let user = user_o.user;
    let token = generateToken(user);

    return {
        "success": true,
        "auth": {
            "user": user,
            "token": token
        }
    }
}

module.exports = {
    getRedirectUrl,
    login
}