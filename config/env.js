'use strict';

let JWT_SECRET = process.env.JWT_SECRET

if(JWT_SECRET==null){
    console.warn("JWT_SECRET env variable not set!");
    JWT_SECRET = "Debug_secret"
}

module.exports = {
    JWT_SECRET
}