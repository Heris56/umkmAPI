const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const UMKM = require('./umkm');

const Produk = sequelize.define('Pesanan', {
    id: {
        field: 'id_pesanan', // Nama id di database
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    statuspesanan: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalbelanja: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    id_keranjang: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: keranjang,
            key: 'id_keranjang'
        }
    },

}, {
    tableName: 'Pesanan',
    timestamps: false
});

module.exports = Pesanan;