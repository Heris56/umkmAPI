const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Adjust the path as needed
const UMKM = require('./umkm'); // Import UMKM model if you need to define the association

const Campaign = sequelize.define('Campaign', {
    id_campaign: {
        field: 'id_campaign', // This should match the column name in the database
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
        type: DataTypes.DATEONLY, // Use DATEONLY to match SQL DATE type
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY, // Use DATEONLY to match SQL DATE type
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Active',
        allowNull: true
    },
    id_umkm: {
        type: DataTypes.INTEGER,
        allowNull: true, // Set to true since not all campaigns may have UMKM
        references: {
            model: UMKM,
            key: 'id_umkm'
        }
    }
}, {
    tableName: 'campaign',
    timestamps: false, // No timestamps since it's not present in the SQL table
});

// Association with UMKM model
Campaign.belongsTo(UMKM, {
    foreignKey: 'id_umkm', // The foreign key
    as: 'umkm', // Alias for the relationship
    onDelete: 'SET NULL', // If UMKM is deleted, set the UMKM id to NULL in campaign
});

module.exports = Campaign;
