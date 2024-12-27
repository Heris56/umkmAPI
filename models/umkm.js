const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const UMKM = sequelize.define('UMKM', {
    id_umkm: {
        field: 'id_umkm', // Nama id di database
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_lengkap: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nomor_telepon: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    alamat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nama_usaha: {
        type: DataTypes.STRING,
        allowNull: true
    },
    NIK_KTP: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

}, {
    tableName: 'umkm',
    timestamps: false
});

module.exports = UMKM;
