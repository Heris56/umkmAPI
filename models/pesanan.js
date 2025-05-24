const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Keranjang = require('./keranjang');

const Pesanan = sequelize.define('Pesanan', {
    id_pesanan: {
        field: 'id_pesanan', // Nama id di database
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status_pesanan: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_belanja: {
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
    histori_pesanan: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
    tableName: 'pesanan',
    timestamps: false
});

module.exports = Pesanan;

Pesanan.belongsTo(Keranjang, { foreignKey: 'id_keranjang' });
Keranjang.hasOne(Pesanan, { foreignKey: 'id_keranjang' });