const connection = require('./db');
const Barang = require('./models/barang');
const Produk = require('./models/produk');
const UMKM = require('./models/umkm');

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

async function getproduk(callback) {
    try {
        const result = await Produk.findAll(); // Ambil data dari tabel produk
        callback(null, result); // return hasil
    } catch (error) {
        callback(error, null); // Kirim error jika terjadi masalah
    }
}

async function addproduk(data, callback) {
    try {
        const result = await Produk.create(data);
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function getuserUMKM(callback) {
    try {
        const result = await UMKM.findAll(); // ambil data tari tabel umkm
        callback(null, result); //return data umkm
    } catch (error) {
        callback(error, null); // Kirim error jika terjadi masalah
    }
}

async function registUMKM(data, callback) {
    try {
        const result = await UMKM.create(data);
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

module.exports = {
    getbarang,
    addbarang,
    getproduk,
    addproduk,
    getuserUMKM,
    registUMKM,
};