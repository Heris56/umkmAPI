const { DataTypes } = require('sequelize');
const sequelize = require('../db');  
const UMKM = require('./umkm'); 

const Campaign = sequelize.define('Campaign', {
    id_campaign: {
        field: 'id_campaign', 
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY, 
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Active',
        allowNull: true
    },
    id_umkm: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: UMKM,
            key: 'id_umkm'
        }
    }
}, {
    tableName: 'campaign',
    timestamps: false, 
});

module.exports = Campaign;
