// models/kurir.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const UMKM = require("./umkm");

const Kurir = sequelize.define(
  "Kurir",
  {
    id_kurir: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_kurir: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    id_umkm: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UMKM,
        key: "id_umkm",
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    tableName: "kurir",
    timestamps: false,
  }
);

// Associations
Kurir.belongsTo(UMKM, { foreignKey: "id_umkm", targetKey: "id_umkm" });

module.exports = Kurir;
