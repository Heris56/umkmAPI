const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import instance Sequelize

const Ulasan = sequelize.define('Ulasan', {
  id_ulasan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  id_pembeli: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_produk: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ulasan: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'ulasans',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
});

module.exports = Ulasan;
