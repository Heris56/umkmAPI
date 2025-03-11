const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Bookmark = sequelize.define('Bookmark', {
    id_bookmark: {
        field: 'id_bookmark',
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_pembeli: {
        field: 'id_pembeli',
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_produk: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Bookmark',
    timestamps: false
});

module.exports = Bookmark