const connection = require('./db');
const Barang = require('./models/barang');

async function getbarang(callback) {
    try {
        const result = await Barang.findAll(); // Ambil semua data dari tabel `barangs`
        callback(null, result); // Kembalikan data
    } catch (error) {
        callback(error, null); // Kirim error jika terjadi masalah
    }
}

async function addbarang(data, callback) {
    try {
        const result = await Barang.create(data);
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

module.exports = {
    getbarang,
    addbarang,
};