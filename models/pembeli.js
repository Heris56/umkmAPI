const { DataTypes } = require('sequelize');
const sequelize = require('../db');  // Adjust to your DB connection setup

const Pembeli = sequelize.define('Pembeli', {
    id_pembeli: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_lengkap: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nomor_telepon: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    alamat: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    profileImg: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'pembeli',
    timestamps: false  // Set to true if you want timestamps for createdAt and updatedAt
});

module.exports = Pembeli;