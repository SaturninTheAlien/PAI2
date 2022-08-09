'use strict';

const { DataTypes, Model } = require('sequelize');
const db = require('../config/database');

const User = require("./User");

class Order extends Model {}

Order.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER
    },
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    shipping_method:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    contents:{
        type: DataTypes.JSON,
        allowNull: false
    },
    price_control_field: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: db
});

Order.belongsTo(User, {
    foreignKey: "user_id",
    onUpdate: 'CASCADE',
    onDelete: "SET NULL"
})

Order.sync();

module.exports = Order;