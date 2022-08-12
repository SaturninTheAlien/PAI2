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
    contents:{
        type: DataTypes.JSON,
        allowNull: false
    },
    total_cost: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    paid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    payment_intent_id:{
        type: DataTypes.STRING
    },
    payment_client_secret:{
        type: DataTypes.STRING
    },
    ts: {
        type: DataTypes.TIME,
        allowNull: false,
    }
}, {
    sequelize: db,
    timestamps: false
});

Order.belongsTo(User, {
    foreignKey: "user_id",
    onUpdate: 'CASCADE',
    onDelete: "SET NULL"
})

Order.sync();

module.exports = Order;