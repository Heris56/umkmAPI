const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../db'); // assuming you already have a sequelize instance in db.js
const umkm = require('./umkm');
const pesanan = require('./pesanan');

const Riwayat = sequelize.define('Riwayat', {
    id_riwayat: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    id_pesanan: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: pesanan, // The name of the related model (should match the actual table name)
            key: 'id_pesanan'
        }
    },
    id_umkm: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: umkm, // The name of the related model (should match the actual table name)
            key: 'id_umkm'
        }
    }
}, {
    tableName: 'riwayat',
    timestamps: false, // Assuming the table does not use the default `createdAt` and `updatedAt` columns
});

module.exports = Riwayat;
