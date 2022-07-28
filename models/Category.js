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
    on_main_page: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    attributes: {
        type:DataTypes.JSON,
        allowNull: false
    },
    abstract: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: db
});

Category.sync();

module.exports = Category;
