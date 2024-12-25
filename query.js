const { default: Message } = require('tedious/lib/message');
const connection = require('./db');
const Barang = require('./models/barang');
const Produk = require('./models/produk');
const UMKM = require('./models/umkm');
const MessageModel = require('./models/message');
const Pembeli = require('./models/pembeli');

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

async function getMessages(senderId, receiverId, senderType, receiverType, callback) {
    try {
        const messages = await MessageModel.findAll({
            where: {
                sender_id: senderId,
                receiver_id: receiverId,
                sender_type: senderType,
                receiver_type: receiverType
            },
            order: [['sent_at', 'ASC']]
        });
        callback(null, messages); 
    } catch (error) {
        callback(error, null); 
    }
}

// Function to send a new message
async function sendMessage(data, callback) {
    try {
        // Ensure required data fields are provided
        if (!data.sender_id || !data.receiver_id || !data.sender_type || !data.receiver_type || !data.message) {
            throw new Error('Data tidak lengkap');
        }

        // Check sender and receiver validity based on sender_type and receiver_type
        let senderExists = false;
        let receiverExists = false;

        // Check if sender exists in the corresponding table based on sender_type
        if (data.sender_type === 'UMKM') {
            senderExists = await UMKM.findByPk(data.sender_id);
        } else if (data.sender_type === 'Kurir') {
            senderExists = await Kurir.findByPk(data.sender_id);
        } else if (data.sender_type === 'Pembeli') {
            senderExists = await Pembeli.findByPk(data.sender_id);
        }

        // Check if receiver exists in the corresponding table based on receiver_type
        if (data.receiver_type === 'UMKM') {
            receiverExists = await UMKM.findByPk(data.receiver_id);
        } else if (data.receiver_type === 'Kurir') {
            receiverExists = await Kurir.findByPk(data.receiver_id);
        } else if (data.receiver_type === 'Pembeli') {
            receiverExists = await Pembeli.findByPk(data.receiver_id);
        }

        // Throw error if either sender or receiver does not exist
        if (!senderExists) {
            throw new Error(`Sender not found in ${data.sender_type}`);
        }

        if (!receiverExists) {
            throw new Error(`Receiver not found in ${data.receiver_type}`);
        }

        // If both sender and receiver are valid, create the message
        const message = await MessageModel.create(data);
        callback(null, message); // Return the created message

    } catch (error) {
        callback(error, null); // Return the error
    }
}

// Function to mark a message as read
async function markMessageAsRead(messageId, callback) {
    try {
        if (!messageId) {
            throw new Error('Message ID tidak boleh kosong');
        }

        const message = await MessageModel.findByPk(messageId); 

        if (!message) {
            throw new Error(`Pesan dengan ID ${messageId} tidak ditemukan`);
        }

        message.is_read = true;
        await message.save();
        callback(null, { Message: `Pesan dengan ID ${messageId} berhasil ditandai sebagai dibaca` });
    } catch (error) {
        callback(error, null); 
    }
}

// Function to delete a message
async function deleteMessage(messageId, callback) {
    try {
        if (!messageId) {
            throw new Error('Message ID tidak boleh kosong');
        }

        const message = await MessageModel.findByPk(messageId);

        if (!message) {
            throw new Error(`Pesan dengan ID ${messageId} tidak ditemukan`);
        }

        await message.destroy(); 
        callback(null, { Message: `Pesan dengan ID ${messageId} berhasil dihapus` });
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
    sendMessage,
    markMessageAsRead,
    deleteMessage,
    getPembeli,
    getPembeliByID,
    addPembeli,
    updatePembeli,
    deletePembeli
};