const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const UMKM = require("./umkm");
const Kurir = require("./kurir");
const Pembeli = require("./pembeli");

const Message = sequelize.define(
  "Message",
  {
    id_chat: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sent_at: {
      type: DataTypes.DATE,  // Gunakan DATE, bukan TIME
      defaultValue: DataTypes.NOW,
      get() {
        const value = this.getDataValue("sent_at");
        return value instanceof Date ? value.toISOString().split("T")[1].split(".")[0] : value;
      },
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    id_umkm: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: UMKM,
        key: "id_umkm",
      },
    },
    id_pembeli: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Pembeli,
        key: "id_pembeli",
      },
    },
    id_kurir: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Kurir,
        key: "id_kurir",
      },
    },
    receiver_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Chat",
    timestamps: false,
  }
);

Message.belongsTo(UMKM, { foreignKey: "id_umkm", as: "umkm" });
Message.belongsTo(Pembeli, { foreignKey: "id_pembeli", as: "pembeli" });
Message.belongsTo(Kurir, { foreignKey: "id_kurir", as: "kurir" });

module.exports = Message;
