#!/usr/bin/node
'use strict';

const userDao = require("./dao/userDao");


const username = "czesiek";
const password = "czesiek123";
const given_name = "Czesław";
const family_name = "Pająk";
const email = "pajonk.czesiek@example.com";
const admin = true;


console.warn('\x1b[33m%s\x1b[0m', "Creating test admin user, don't do it on production!");

userDao.postUser({username, password, given_name, family_name, email, admin}, true).then(user_o=>{
    if(!user_o.success){
        console.error(`Cannot create test user, ${user_o.message}`);
        process.exit(2);
    }
    else{
        const user = user_o.user;
        console.log(`Successfully created test admin user ${user.username}:${password}.`);
    }

}).catch(err=>{
    console.error(err);
    process.exit(1);
});
