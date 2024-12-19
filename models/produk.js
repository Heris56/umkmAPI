const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const UMKM = require('./umkm');

const Produk = sequelize.define('Produk', {
    id: {
        field: 'id_produk', // Nama id di database
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
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
    id_umkm: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: UMKM,
            key: 'id_umkm'
        }
    },

}, {
    tableName: 'Produk',
    timestamps: false
});

module.exports = Produk;