const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const UMKM = require('./umkm');
const Pesanan = require('./pesanan');

const Riwayat = sequelize.define('Riwayat', {
    id_riwayat: {
        field: 'id_riwayat',
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tanggal: {
        type: DataTypes.DATE,
        allowNull: false
    },
    id_pesanan: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Pesanan,
            key: 'id_pesanan'
        }
    },

}, {
    tableName: 'Riwayat',
    timestamps: false
});

module.exports = Riwayat;

Riwayat.belongsTo(Pesanan, { foreignKey: 'id_pesanan' });
Pesanan.hasMany(Riwayat, { foreignKey: 'id_pesanan' });
