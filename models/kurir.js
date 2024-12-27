// models/kurir.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const UMKM = require('./umkm');  
const Pesanan = require('./pesanan');  


const Kurir = sequelize.define('Kurir', {
    id_kurir: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama_kurir: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    id_umkm: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    id_pesanan: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'kurir',
    timestamps: false
});

// Associations
Kurir.belongsTo(UMKM, { foreignKey: 'id_umkm', targetKey: 'id_umkm' });
Kurir.belongsTo(Pesanan, { foreignKey: 'id_pesanan', targetKey: 'id_pesanan' });


module.exports = Kurir;
