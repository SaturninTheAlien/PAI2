'use strict';

const { DataTypes, Model } = require('sequelize');
const db = require('../config/database');

class Category extends Model {}

Category.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    attributes: {
        type:DataTypes.JSON,
        allowNull: false
    }
}, {
    sequelize: db
});

Category.sync();

module.exports = Category;
