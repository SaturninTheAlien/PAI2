'use strict';
const { DataTypes, Model } = require('sequelize');
const db = require('../config/database');

class User extends Model {}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nickname:{
        type: DataTypes.STRING,
        allowNull: false
    },
    picture: {
        type: DataTypes.STRING
    },
    username: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false        
    },
    given_name: {
        type: DataTypes.STRING
    },
    family_name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    google_id:{
        type: DataTypes.STRING,
        unique: true
    }
}, {
    sequelize: db
});

User.sync();

module.exports = User;
