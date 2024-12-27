// query.js
const connection = require('./db');
const Produk = require('./models/produk');
const UMKM = require('./models/umkm');
const Message = require('./models/message');
const Pembeli = require('./models/pembeli');
const Pesanan = require('./models/pesanan')
const Kurir = require('./models/kurir');
const Riwayat = require('./models/riwayat');


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

async function updateProduk(id, callback) {
    try {
        if (!id) {
            throw new error('id tidak boleh kosong');
        }

        const produk = await Produk.findByPk(id);

        if (!produk) {
            throw new error('produk tidak ditemukan');
        }


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

// Get all messages
async function getMessages(callback) {
    try {
        const messages = await Message.findAll();
        callback(null, messages);
    } catch (error) {
        callback(error, null);
    }
}

// Get messages by sender and receiver
async function getMessagesBySenderReceiver(senderType, senderId, receiverType, receiverId, callback) {
    try {
        const messages = await Message.findAll({
            where: {
                sender_type: senderType,
                sender_id: senderId,
                receiver_type: receiverType,
                receiver_id: receiverId
            },
            order: [['sent_at', 'ASC']]
        });
        callback(null, messages);
    } catch (error) {
        callback(error, null);
    }
}

// Send a message
async function sendMessage(data, callback) {
    try {
        const message = await Message.create(data);
        callback(null, message);
    } catch (error) {
        callback(error, null);
    }
}

// Mark message as read
async function markMessageAsRead(id, callback) {
    try {
        const message = await Message.findByPk(id);
        if (!message) {
            throw new Error(`Message with ID ${id} not found`);
        }
        message.is_read = true;
        await message.save();
        callback(null, message);
    } catch (error) {
        callback(error, null);
    }
}

// Delete a message
async function deleteMessage(id, callback) {
    try {
        const message = await Message.findByPk(id);
        if (!message) {
            throw new Error(`Message with ID ${id} not found`);
        }
        await message.destroy();
        callback(null, { message: `Message with ID ${id} has been deleted` });
    } catch (error) {
        callback(error, null);
    }
}

// Get all pembeli
async function getPembeli(callback) {
    try {
        const result = await Pembeli.findAll();  // Get all pembeli data
        callback(null, result);
    } catch (error) {
        callback(error, null);  // Send error if something goes wrong
    }
}

// Get pembeli by ID
async function getPembeliByID(id, callback) {
    try {
        if (!id) {
            throw new Error('ID cannot be empty');
        }

        const pembeli = await Pembeli.findByPk(id);

        if (!pembeli) {
            throw new Error(`Pembeli with ID ${id} not found`);
        }

        callback(null, pembeli);  // Send the pembeli data
    } catch (error) {
        callback(error, null);
    }
}

// Add a new pembeli
async function addPembeli(data, callback) {
    try {
        if (!data.nama_lengkap || !data.nomor_telepon || !data.username || !data.email || !data.password) {
            throw new Error('Incomplete data');
        }

        const result = await Pembeli.create(data);  // Add new pembeli to the table
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

// Update pembeli information
async function updatePembeli(id, data, callback) {
    try {
        if (!id) {
            throw new Error('ID cannot be empty');
        }

        const pembeli = await Pembeli.findByPk(id);

        if (!pembeli) {
            throw new Error(`Pembeli with ID ${id} not found`);
        }

        const updatedPembeli = await pembeli.update(data);  // Update pembeli
        callback(null, updatedPembeli);
    } catch (error) {
        callback(error, null);
    }
}

// Delete pembeli
async function deletePembeli(id, callback) {
    try {
        if (!id) {
            throw new Error('ID cannot be empty');
        }

        const pembeli = await Pembeli.findByPk(id);

        if (!pembeli) {
            throw new Error(`Pembeli with ID ${id} not found`);
        }

        await pembeli.destroy();  // Delete pembeli from the table
        callback(null, { message: `Pembeli with ID ${id} has been deleted` });
    } catch (error) {
        callback(error, null);
    }
}

// Get all kurirs
async function getKurir(callback) {
    try {
        const kurirs = await Kurir.findAll({
            include: [
                { model: UMKM, attributes: ['nama_umkm'] },
                { model: Pesanan, attributes: ['kode_pesanan'] }
            ]
        });
        callback(null, kurirs);
    } catch (error) {
        callback(error, null);
    }
}

// Get kurir by ID
async function getKurirByID(id, callback) {
    try {
        const kurir = await Kurir.findByPk(id, {
            include: [
                { model: UMKM, attributes: ['nama_umkm'] },
                { model: Pesanan, attributes: ['kode_pesanan'] }
            ]
        });
        if (!kurir) {
            return callback(new Error('Kurir not found'), null);
        }
        callback(null, kurir);
    } catch (error) {
        callback(error, null);
    }
}

// Add a new kurir
async function addKurir(data, callback) {
    try {
        const newKurir = await Kurir.create({
            nama_kurir: data.nama_kurir,
            id_umkm: data.id_umkm,
            id_pesanan: data.id_pesanan
        });
        callback(null, newKurir);
    } catch (error) {
        callback(error, null);
    }
}

// Update kurir by ID
async function updateKurir(id, data, callback) {
    try {
        const kurir = await Kurir.findByPk(id);
        if (!kurir) {
            return callback(new Error('Kurir not found'), null);
        }
        await kurir.update({
            nama_kurir: data.nama_kurir,
            id_umkm: data.id_umkm,
            id_pesanan: data.id_pesanan
        });
        callback(null, kurir);
    } catch (error) {
        callback(error, null);
    }
}

// Delete kurir by ID
async function deleteKurir(id, callback) {
    try {
        const kurir = await Kurir.findByPk(id);
        if (!kurir) {
            return callback(new Error('Kurir not found'), null);
        }
        await kurir.destroy();
        callback(null, { message: 'Kurir deleted successfully' });
    } catch (error) {
        callback(error, null);
    }
}

async function getpesananmasuk(callback) {
    try {
        const result = await Pesanan.findAll({ where: { status_pesanan: 'Pesanan Masuk' } }); // Ambil semua data dari tabel `barangs`
        callback(null, result); // Kembalikan data
    } catch (error) {
        callback(error, null); // Kirim error jika terjadi masalah
    }
}

async function getStatusBulan(umkmId, month, year) {
    try {
        const result = await sequelize.query(`
            SELECT 
                r.tanggal AS tanggal,
                SUM(pm.harga * CAST(pm.quantitas_barang AS INT)) AS total_sales, -- Cast to INT
                COUNT(DISTINCT p.id_pesanan) AS total_orders
            FROM 
                pesanan p
            JOIN 
                pesananMasuk pm ON p.id_pesanan = pm.id_pesanan
            JOIN 
                riwayat r ON p.id_pesanan = r.id_pesanan
            WHERE 
                pm.id_umkm = :umkmId
                AND MONTH(r.tanggal) = :month
                AND YEAR(r.tanggal) = :year
            GROUP BY 
                r.tanggal
            ORDER BY 
                r.tanggal;
        `, {
            replacements: { umkmId, month, year },
            type: QueryTypes.SELECT
        });

        return result; // Return the result instead of using a callback
    } catch (error) {
        console.error('Error fetching daily stats:', error);
        throw error; // Throw the error to be handled in the calling function
    }
}

async function getStatusOverAll(umkmId) {
    try {
        const result = await sequelize.query(`
            SELECT 
                MONTH(r.tanggal) AS month,
                SUM(pm.harga * CAST(pm.quantitas_barang AS INT)) AS total_sales,
                COUNT(DISTINCT p.id_pesanan) AS total_orders
            FROM 
                pesanan p
            JOIN 
                pesananMasuk pm ON p.id_pesanan = pm.id_pesanan
            JOIN 
                riwayat r ON p.id_pesanan = r.id_pesanan
            WHERE 
                pm.id_umkm = :umkmId
            GROUP BY 
                MONTH(r.tanggal)
            ORDER BY 
                month;
        `, {
            replacements: { umkmId },
            type: QueryTypes.SELECT
        });

        return result; // Return the result instead of using a callback
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        throw error; // Throw the error to be handled in the calling function
    }
}

async function getRiwayat(callback) {
    try {
        const result = await Riwayat.findAll(); // ambil data tari tabel umkm
        callback(null, result); //return data umkm
    } catch (error) {
        callback(error, null); // Kirim error jika terjadi masalah

    }
}

module.exports = {
    getproduk,
    getprodukbyID,
    addproduk,
    deleteproduk,
    getuserUMKM,
    registUMKM,
    loginUMKM,
    getMessages,
    getMessagesBySenderReceiver,
    sendMessage,
    markMessageAsRead,
    deleteMessage,
    getPembeli,
    getPembeliByID,
    addPembeli,
    updatePembeli,
    deletePembeli,
    getKurir,
    getKurirByID,
    addKurir,
    updateKurir,
    deleteKurir,
    getpesananmasuk,
    getStatusOverAll,
    getStatusBulan,
    getRiwayat,

};