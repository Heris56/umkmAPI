const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Produk = sequelize.define('Produk', {
    harga: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    stok: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    berat: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    nama_barang: {
        type: DataTypes.STRING,
        allowNull: false
    },
    deskripsi_barang: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tableName: 'produk'
});

module.exports = Produk;