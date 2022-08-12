#!/usr/bin/node
'use strict';

const userDao = require("./dao/userDao");


async function createUser(user){
    let res = await userDao.postUser(user, true);
    if(!res.success){
        console.error(`Cannot create test user, ${res.message}`);
    }
    else{
        console.log(`Successfully created test user ${user.username}:${user.password} admin:${user.admin}.`);
    }
}

function createTestUsers(){
    console.warn('\x1b[33m%s\x1b[0m', "Creating test users (including admin user), don't do it on production!");

    createUser({
        "username": "czesiek",
        "password": "czesiek123",
        "given_name": "Czesław",
        "family_name": "Pająk",
        "email": "pajonk.czesiek@example.com",
        "admin": true
    }).catch(console.error);

    createUser({
        "username": "janusz",
        "password": "janusz987",
        "given_name": "Janusz",
        "family_name": "Nosacz",
        "email": "janusz.nosacz@example.com",
        "admin": false,
        "picture": "https://upload.wikimedia.org/wikipedia/commons/3/32/Proboscis_monkey_%28Nasalis_larvatus%29_male_head.jpg"
    }).catch(console.error);
}


createTestUsers();