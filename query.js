const { default: Message } = require('tedious/lib/message');
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

async function getprodukbyID(id, callback) {
    try {
        if (!id) {
            throw new error('id tidak boleh kosong');
        }

        const produk = await Produk.findByPk(id);

        if (!produk) {
            throw new Error(`Produk dengan ID ${id} tidak ditemukan`);
        }
        callback(null, produk);
    } catch (error) {
        callback(error, null);
    }
}

async function deleteproduk(id, callback) {
    try {
        if (!id) {
            throw new error('id tidak boleh kosong')
        }

        const produk = await Produk.findByPk(id);

        if (!produk) {
            throw new Error(`Produk dengan ID ${id} tidak ditemukan`);
        }

        await produk.destroy();
        callback(null, { Message: `produk dengan id ${id} berhasil dihapus` })
    } catch (error) {
        callback(error, null);
    }
}

async function addproduk(data, callback) {
    try {
        if (!data.harga || !data.stok || !data.berat || !data.nama_barang || !data.id_umkm) {
            throw new Error('Data tidak lengkap');
        }

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

async function loginUMKM(data, callback) {
    try {
        // cari by email
        const user = await UMKM.findOne({ where: { email: data.LoginEmail } });

        // cek kalo usernya ada, dan passwordnya sesuai
        if (user && user.password === data.LoginPassword) {
            callback(null, user);
        } else {
            callback(new Error('Email atau Password salah!'), null);
        }
    } catch (error) {
        callback(error, null);
    }
}

module.exports = {
    getbarang,
    addbarang,
    getproduk,
    getprodukbyID,
    addproduk,
    deleteproduk,
    getuserUMKM,
    registUMKM,
    loginUMKM,
};