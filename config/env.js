'use strict';

let JWT_SECRET = process.env.JWT_SECRET
let GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
let GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
let GOOGLE_CLIENT_REDIRECT_URI = process.env.GOOGLE_CLIENT_REDIRECT_URI || "http://localhost:8080/auth/google/callback"

if(GOOGLE_CLIENT_ID==null || GOOGLE_CLIENT_SECRET==null){
    console.warn('\x1b[33m%s\x1b[0m', "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET env variable not set, impossible to sign in with Google!");
}

if(JWT_SECRET==null){
    console.warn('\x1b[33m%s\x1b[0m', "JWT_SECRET env variable not set, using default value, completely insecure!");
    JWT_SECRET = "Debug_secret"
}

module.exports = {
    JWT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_REDIRECT_URI,
}