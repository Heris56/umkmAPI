const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('umkmku', 'asepgantenk', '!13Juli2002', {
    host: 'umkmkuserver.database.windows.net',
    dialect: 'mssql',
    dialectOptions: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: false
    },
    port: 1433,
    logging: false, // Matikan log SQL untuk produksi
});

sequelize.authenticate()
    .then(() => console.log('Berhasil terhubung dengan Sequelize ke database SQL Server'))
    .catch(err => console.error('Gagal koneksi ke database:', err));

module.exports = sequelize;