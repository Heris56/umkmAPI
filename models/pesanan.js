const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const UMKM = require('./umkm');
const Keranjang = require('./keranjang');

const Pesanan = sequelize.define('Pesanan', {
    id_pesanan: {
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
            model: Keranjang,
            key: 'id_keranjang'
        }
    },

}, {
    tableName: 'Pesanan',
    timestamps: false
});

module.exports = Pesanan;