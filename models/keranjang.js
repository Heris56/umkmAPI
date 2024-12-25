const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const UMKM = require('./umkm');
const Pembeli = require('./pembeli');
const Produk = require('./produk');

const Keranjang = sequelize.define('Keranjang', {
    id_keranjang: {
        field: 'id_keranjang', // Nama id di database
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    kuantitas: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_pembeli: {
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
    },
}, {
    tableName: 'Pesanan',
    timestamps: false
});

module.exports = Keranjang;