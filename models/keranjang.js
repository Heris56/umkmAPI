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
        allowNull: true
    },
    kuantitas: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_pembeli: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Pembeli,
            key: 'id_pembeli'
        }
    },
    id_produk: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Produk,
            key: 'id_produk'
        }
    },
    id_batch: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    tableName: 'keranjang',
    timestamps: false
});

module.exports = Keranjang;

Keranjang.belongsTo(Produk, { foreignKey: 'id_produk' });
Keranjang.belongsTo(Pembeli, { foreignKey: 'id_pembeli' });
Produk.hasMany(Keranjang, { foreignKey: 'id_produk' });
Pembeli.hasMany(Keranjang, { foreignKey: 'id_pembeli' });