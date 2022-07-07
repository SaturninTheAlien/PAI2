'use strict';

let JWT_SECRET = process.env.JWT_SECRET

if(JWT_SECRET==null){
    console.warn('\x1b[33m%s\x1b[0m', "JWT_SECRET env variable not set, using default value, completely insecure!");
    JWT_SECRET = "Debug_secret"
}

module.exports = {
    JWT_SECRET
}