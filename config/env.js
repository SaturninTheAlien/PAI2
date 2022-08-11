'use strict';

function getEnvVariableOrDefault(variableName, fallbackValue, critical=false){
    let v = process.env[variableName];
    if(v==null){
        v = fallbackValue;
        if(critical){
            console.warn('\x1b[31m%s\x1b[0m',
            `${variableName} env variable not set, using default value: "${fallbackValue}", completely insecure!`);
        }
        else{
            console.warn('\x1b[33m%s\x1b[0m',
            `${variableName} env variable not set, using default value: "${fallbackValue}".`);
        }
    }
    return v;
}

const DOMAIN = getEnvVariableOrDefault("DOMAIN", "http://localhost:8080");
const ALLOWED_CORS = getEnvVariableOrDefault("ALLOWED_CORS", "http://localhost:3000");
const JWT_SECRET = getEnvVariableOrDefault("JWT_SECRET", "Debug_secret", true);


const STRIPE_PUBLISHABLE_KEY = getEnvVariableOrDefault("STRIPE_PUBLISHABLE_KEY",
"pk_test_51AROWSJX9HHJ5bycpEUP9dK39tXufyuWogSUdeweyZEXy3LC7M8yc5d9NlQ96fRCVL0BlAu7Nqt4V7N5xZjJnrkp005fDiTMIr");

const STRIPE_SECRET_KEY = getEnvVariableOrDefault("STRIPE_SECRET_KEY",
"sk_test_7mJuPfZsBzc3JkrANrFrcDqC");


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if(STRIPE_WEBHOOK_SECRET==null){
    console.warn('\x1b[33m%s\x1b[0m', "STRIPE_WEBHOOK_SECRET env variable not set.");
}


if(GOOGLE_CLIENT_ID==null || GOOGLE_CLIENT_SECRET==null){
    console.warn('\x1b[33m%s\x1b[0m', "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET env variable not set, impossible to sign in with Google!");
}

module.exports = {
    DOMAIN,
    ALLOWED_CORS,
    JWT_SECRET,

    STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,

    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
}