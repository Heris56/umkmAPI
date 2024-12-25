// query.js
const connection = require('./db');
const Produk = require('./models/produk');
const UMKM = require('./models/umkm');
const Message = require('./models/message');
const Pembeli = require('./models/pembeli');
const Kurir = require('./models/kurir');


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
    getMessages,
    getMessagesBySenderReceiver,
    sendMessage,
    markMessageAsRead,
    deleteMessage,
    getPembeli,
    getPembeliByID,
    addPembeli,
    updatePembeli,
    deletePembeli
};