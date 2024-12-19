const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import instance Sequelize

const Barang = sequelize.define('Barang', {
    nama: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    harga: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    stok: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'barangs', // Nama tabel di database
    timestamps: false,   // Nonaktifkan createdAt dan updatedAt
});

module.exports = Barang;
