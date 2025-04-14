const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Produk = require('./Produk');
const Pembeli = require('./pembeli');

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
        allowNull: false,
        references: {
            model: Pembeli,
            key: 'id_pembeli'
        }
    },
    id_produk: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Produk,
            key: 'id_produk'
        }
    }
}, {
    tableName: 'Bookmark',
    timestamps: false
});

Bookmark.belongsTo(Produk, { foreignKey: 'id_produk' });

module.exports = Bookmark