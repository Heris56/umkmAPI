const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const UMKM = require('./umkm');
const Kurir = require('./kurir');
const Pembeli = require('./pembeli');

const Message = sequelize.define('Message', {
    id_chat: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sender_type: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    sender_id: {
        type: DataTypes.INTEGER, 
        allowNull: false
    },
    receiver_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    receiver_id: {
        type: DataTypes.INTEGER, 
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sent_at: {
        type: DataTypes.TIME,
        defaultValue: DataTypes.NOW 
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Chat',
    timestamps: false 
});

// Sender associations
Message.belongsTo(UMKM, { foreignKey: 'sender_id', targetKey: 'id', as: 'sender_umkm' });
Message.belongsTo(Kurir, { foreignKey: 'sender_id', targetKey: 'id_kurir', as: 'sender_kurir' });
Message.belongsTo(Pembeli, { foreignKey: 'sender_id', targetKey: 'id_pembeli', as: 'sender_pembeli' });

// Receiver associations
Message.belongsTo(UMKM, { foreignKey: 'receiver_id', targetKey: 'id', as: 'receiver_umkm' });
Message.belongsTo(Kurir, { foreignKey: 'receiver_id', targetKey: 'id_kurir', as: 'receiver_kurir' });
Message.belongsTo(Pembeli, { foreignKey: 'receiver_id', targetKey: 'id_pembeli', as: 'receiver_pembeli' });

module.exports = Message;
