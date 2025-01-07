const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Import instance Sequelize

const Ulasan = sequelize.define('Ulasan', {
  id_pembeli: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  createdAt: 'tanggal_dibuat',
});

module.exports = Ulasan;
