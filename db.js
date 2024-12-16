// db yang dibutuhin
const sql = require('mssql');

const dbconfig = {
    user: 'mamankAdmin',
    password: 'Mamank123',
    server: 'umkmku.database.windows.net',
    database: 'umkmku',
    Options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: false
    },
    port: 1433
}

const connection = new sql.ConnectionPool(dbconfig);

connection.connect((err) => {
    if (err) {
        console.error('error saat mencoba koneksi ke database: ', err.stack);
        return
    }
    console.log('berhasil koneksi ke database dengan sql azure database');
});

module.exports = connection;