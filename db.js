const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('railway', 'root', 'BUaYYXhncuMAoUVNGHHDXNUpkleFazKg', {
    host: 'shuttle.proxy.rlwy.net',
    dialect: 'mysql',
    port: 25067,
    logging: false, // Matikan log SQL untuk produksi
});

sequelize.authenticate()
    .then(() => console.log('Berhasil terhubung dengan Sequelize ke database SQL Server'))
    .catch(err => console.error('Gagal koneksi ke database:', err));

module.exports = sequelize;