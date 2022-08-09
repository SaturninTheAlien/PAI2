'use strict';

let DOMAIN = process.env.DOMAIN

let JWT_SECRET = process.env.JWT_SECRET
let GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
let GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
//let GOOGLE_CLIENT_REDIRECT_URI = process.env.GOOGLE_CLIENT_REDIRECT_URI || "http://localhost:8080/auth/google/callback"
let ALLOWED_CORS = process.env.ALLOWED_CORS

if(GOOGLE_CLIENT_ID==null || GOOGLE_CLIENT_SECRET==null){
    console.warn('\x1b[33m%s\x1b[0m', "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET env variable not set, impossible to sign in with Google!");
}

if(DOMAIN==null){
    console.warn('\x1b[33m%s\x1b[0m', "DOMAIN env variable not set, using default value.");
    DOMAIN = "http://localhost:8080"
}

if(JWT_SECRET==null){
    console.warn('\x1b[33m%s\x1b[0m', "JWT_SECRET env variable not set, using default value, completely insecure!");
    JWT_SECRET = "Debug_secret"
}

if(ALLOWED_CORS==null){
    console.warn('\x1b[33m%s\x1b[0m', "ALLOWED_CORS env variable not set, using default value.");
    ALLOWED_CORS = "http://localhost:3000"
}

module.exports = {
    DOMAIN,
    ALLOWED_CORS,
    JWT_SECRET,

    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
}