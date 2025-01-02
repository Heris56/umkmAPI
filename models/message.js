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
      type: DataTypes.TIME,
      defaultValue: DataTypes.NOW,
      get() {
        // Format time as HH:mm:ss before returning
        const value = this.getDataValue("sent_at");
        return value ? value.toISOString().split("T")[1].split(".")[0] : null;
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

// Sender associations
// Message.belongsTo(UMKM, { foreignKey: 'sender_id', targetKey: 'id_umkm', as: 'sender_umkm' });
// Message.belongsTo(Kurir, { foreignKey: 'sender_id', targetKey: 'id_kurir', as: 'sender_kurir' });
// Message.belongsTo(Pembeli, { foreignKey: 'sender_id', targetKey: 'id_pembeli', as: 'sender_pembeli' });

// // Receiver associations
// Message.belongsTo(UMKM, { foreignKey: 'receiver_id', targetKey: 'id_umkm', as: 'receiver_umkm' });
// Message.belongsTo(Kurir, { foreignKey: 'receiver_id', targetKey: 'id_kurir', as: 'receiver_kurir' });
// Message.belongsTo(Pembeli, { foreignKey: 'receiver_id', targetKey: 'id_pembeli', as: 'receiver_pembeli' });

module.exports = Message;
