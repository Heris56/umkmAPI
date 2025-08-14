const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('umkmku', 'root', '', {
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306,
    logging: false, // Matikan log SQL untuk produksi
});

sequelize.authenticate()
    .then(() => console.log('Berhasil terhubung dengan Sequelize ke database SQL Server'))
    .catch(err => console.error('Gagal koneksi ke database:', err));

module.exports = sequelize;