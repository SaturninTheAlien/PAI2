'use strict';

const { DataTypes, Model } = require('sequelize');
const db = require('../config/database');

const Category = require("./Category");

class Product extends Model {}

Product.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    picture_url: {
        type: DataTypes.STRING
    },
    attributes: {
        type: DataTypes.JSON
    }

}, {
    sequelize: db
});

Product.belongsTo(Category, {
    foreignKey: 'category_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Product.sync();

module.exports = Product;
