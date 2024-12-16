const connection = require('./db');

function getbarang(callback) {
    const query = 'select * from barangs';
    connection.query(query, (error, result) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, result);
    });
}

module.exports = {
    getbarang,
};