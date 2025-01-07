// query.js
const connection = require("./db");
const Produk = require("./models/produk");
const UMKM = require("./models/umkm");
const Ulasan = require("./models/ulasan");
const Message = require("./models/message");
const Pembeli = require("./models/pembeli");
const Pesanan = require("./models/pesanan");
const Riwayat = require("./models/riwayat");
const Keranjang = require("./models/keranjang");
const Kurir = require("./models/kurir");
const Campaign = require("./models/campaign");
const { QueryTypes, where } = require("sequelize");
const sequelize = require("./db");
const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const AZURE_STORAGE_CONNECTION_STRING =
    process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
);

// Produk - Haikal
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
            throw new error("id tidak boleh kosong");
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

async function getprodukbyIDUMKM(id, callback) {
    try {
        if (!id) {
            throw new Error("id tida ditemukan di parameter");
        }

        const umkm = await UMKM.findByPk(id);
        if (!umkm) {
            throw new Error("UMKM tidak ditemukan");
        }

        const result = await Produk.findAll({
            where: { id_umkm: id },
        });

        callback(null, result);
    } catch (error) {
        console.log(error);
        callback(error, null);
    }
}

async function updateProduk(id, data, callback) {
    try {
        if (!id) {
            throw new Error("id tidak boleh kosong");
        }

        const produk = await Produk.findByPk(id);

        if (!produk) {
            throw new Error("produk tidak ditemukan");
        }

        const updatedProduk = await produk.update(data);

        callback(null, updatedProduk);
    } catch (error) {
        callback(error, null);
    }
}

async function deleteproduk(id, callback) {
    try {
        if (!id) {
            throw new error("id tidak boleh kosong");
        }

        const produk = await Produk.findByPk(id);

        if (!produk) {
            throw new Error(`Produk dengan ID ${id} tidak ditemukan`);
        }

        await produk.destroy();
        callback(null, { Message: `produk dengan id ${id} berhasil dihapus` });
    } catch (error) {
        callback(error, null);
    }
}

async function addproduk(data, callback) {
    try {
        console.log(data);
        if (
            !data.harga ||
            !data.stok ||
            !data.berat ||
            !data.nama_barang ||
            !data.id_umkm
        ) {
            throw new Error("Data tidak lengkap");
        }

        const result = await Produk.create(data);
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function getProdukByType(tipe_barang, callback) {
    try {
        // Fetch all products where tipe_barang matches the provided value
        const result = await Produk.findAll({
            where: { tipe_barang },
        });
        // Return the results through the callback
        callback(null, result);
    } catch (error) {
        // Send error if something goes wrong
        callback(error, null);
    }
}

// end of // Produk - Haikal

// bagian keranjang
async function getkeranjangstandby(id_pembeli, callback) {
    try {
        if (!id_pembeli) {
            throw new Error('id pembeli tidak ditemukan');
        }

        const keranjang = await Keranjang.findAll(
            {
                where: { id_pembeli: id_pembeli, status: "Standby" },
                include: {
                    model: Produk,
                    attributes: ["nama_barang", "image_url", "harga"]
                }
            }
        );
        callback(null, keranjang);
    } catch (error) {
        callback(error, null);
    }
}

async function getallKeranjang(callback) {
    try {
        const result = await Keranjang.findAll();
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function getkeranjangbyID(id_pembeli, callback) {
    try {
        if (!id_pembeli) {
            throw new Error("id tidak ditemukan");
        }
        const result = await Keranjang.findAll({
            where: {
                id_pembeli: id_pembeli,
            },
        });
        if (!result || result.length === 0) {
            throw new Error("data keranjang tidak ditemukan");
        }
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function addtoKeranjang(data, callback) {
    try {
        if (!data.total || !data.kuantitas || !data.id_pembeli || !data.id_produk) {
            throw new Error("Data Harus terisi semua");
        }

        data.status = 'Standby'
        const result = await Keranjang.create(data);
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function updatestatuskeranjang(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak boleh kosong");
        }

        const updatestatus = await Keranjang.update(
            { status: "Deleted" },
            { where: { id_pembeli: id } }
        );


        callback(null, updatestatus);
    } catch (error) {
        callback(error, null);
    }
}

async function order(callback) {
    try {


        if (!data.total_belanja || !data.id_keranjang) {
            throw new Error("Incomplete data");
        }
        addpesanan()

    } catch (error) {
        callback(error, null);
    }
}

// end of keranjang

// UMKM
async function getuserUMKMbyID(id, callback) {
    try {
        if (!id) {
            throw new Error('tidak ada ID di parameter');
        }
        const umkm = await UMKM.findByPk(id);

        if (!umkm) {
            throw new Error('tidak menemukan umkm');
        }

        callback(null, umkm);
    } catch (error) {
        callback(error, null);
    }
}

async function getalluserUMKM(callback) {
    try {
        const result = await UMKM.findAll(); // ambil data tari tabel umkm
        callback(null, result); //return data umkm
    } catch (error) {
        callback(error, null); // Kirim error jika terjadi masalah
    }
}

async function registUMKM(data, callback) {
    try {
        console.log("Incoming data:", data);
        const result = await UMKM.create(data);
        callback(null, result);
    } catch (error) {
        console.error("Error during registration:", error);
        callback(error, null);
    }
}

async function loginUMKM(data, callback) {
    try {
        // cari by email
        const user = await UMKM.findOne({ where: { email: data.inputEmail } });

        // cek kalo usernya ada, dan passwordnya sesuai
        if (user && user.password === data.inputPassword) {
            const result = {
                id_umkm: user.id_umkm,
            };
            callback(null, result);
        } else {
            callback(new Error("Email atau Password salah!"), null);
        }
    } catch (error) {
        callback(error, null);
    }
}
// end of bagian UMKM

// Start query ulasans
async function getulasans(callback) {
    try {
        const result = await Ulasan.findAll();
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function getulasansByProdukId(id_umkm, callback) {
    try {
        const result = await Ulasan.findAll({
            where: {
                id_umkm: id_umkm
            }
        });
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function getOverallRating(id_umkm, callback) {
    try {
        // Fetch all ratings for the given shop (id_umkm)
        const reviews = await Ulasan.findAll({
            where: {
                id_umkm: id_umkm // Assuming id_produk is the product/shop ID
            }
        });

        // Check if there are any reviews
        if (reviews.length === 0) {
            return callback(null, { overallRating: 0, totalReviews: 0 }); // No reviews for the shop
        }

        // Calculate the sum of ratings
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

        // Calculate the average rating
        const overallRating = totalRating / reviews.length;

        // Return the calculated overall rating and the total number of reviews
        callback(null, { overallRating: parseFloat(overallRating.toFixed(2)), totalReviews: reviews.length });
    } catch (error) {
        callback(error, null); // Handle errors
    }
}
//  End query ulasans

// START API EL SIPIT

// Get all messages
async function getMessages(callback) {
    try {
        const messages = await Message.findAll({
            order: [["sent_at", "ASC"]],
        });
        callback(null, messages);
    } catch (error) {
        callback(error, null);
    }
}

// Get messages by sender and receiver UMKM
async function getMessagesByUMKM(id_umkm, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
                Chat.*,
                pembeli.nama_lengkap,
                umkm.username
            FROM
                Chat
            LEFT JOIN
                pembeli ON Chat.id_pembeli = pembeli.id_pembeli
            LEFT JOIN
                umkm ON Chat.id_umkm = umkm.id_umkm
            WHERE
                umkm.id_umkm = :id_umkm
                ORDER BY
                Chat.id_pembeli ASC;
        `,
            {
                replacements: { id_umkm: id_umkm },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getmessagesbyUMKMandPembeli(id_umkm, id_pembeli, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
                Chat.*,
                pembeli.nama_lengkap,
                umkm.username
            FROM
                Chat
            LEFT JOIN
                pembeli ON Chat.id_pembeli = pembeli.id_pembeli
            LEFT JOIN
                umkm ON Chat.id_umkm = umkm.id_umkm
            WHERE
                umkm.id_umkm = :id_umkm AND pembeli.id_pembeli = :id_pembeli;
        `,
            {
                replacements: { id_umkm: id_umkm, id_pembeli: id_pembeli },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

// Get messages by sender and receiver Pembeli
async function getMessagesByPembeli(id_pembeli, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
                Chat.*,
                pembeli.nama_lengkap,
                umkm.username
            FROM
                Chat
            LEFT JOIN
                pembeli ON Chat.id_pembeli = pembeli.id_pembeli
            LEFT JOIN
                umkm ON Chat.id_umkm = umkm.id_umkm
            LEFT JOIN
                kurir ON Chat.id_kurir = kurir.id_kurir
            WHERE
                pembeli.id_pembeli = :id_pembeli
            ORDER BY
                
                Chat.id_umkm ASC;
            `,
            // tambah Chat.receiver_type ASC klo mau enak liat postmannya
            {
                replacements: { id_pembeli: id_pembeli },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getMessagesByPembeliAndUMKM(id_pembeli, id_umkm, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
                Chat.*,
                pembeli.nama_lengkap,
                umkm.username
            FROM
                Chat
            LEFT JOIN
                pembeli ON Chat.id_pembeli = pembeli.id_pembeli
            LEFT JOIN
                umkm ON Chat.id_umkm = umkm.id_umkm
            WHERE
                pembeli.id_pembeli = :id_pembeli AND umkm.id_umkm = :id_umkm
            `,
            {
                replacements: { id_pembeli: id_pembeli, id_umkm: id_umkm },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

// Fungsi untuk mendapatkan pesan berdasarkan ID Pembeli dan ID Kurir
async function getMessagesByPembeliAndKurir(id_pembeli, id_kurir, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
                Chat.*,
                pembeli.nama_lengkap,
                kurir.nama_kurir
            FROM
                Chat
            LEFT JOIN
                pembeli ON Chat.id_pembeli = pembeli.id_pembeli
            LEFT JOIN
                kurir ON Chat.id_kurir = kurir.id_kurir
            WHERE
                pembeli.id_pembeli = :id_pembeli AND kurir.id_kurir = :id_kurir
            `,
            {
                replacements: { id_pembeli: id_pembeli, id_kurir: id_kurir },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

// Get messages by sender and receiver Kurir
async function getMessagesByKurir(id_kurir, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
                Chat.*,
                pembeli.nama_lengkap,
                kurir.nama_kurir
            FROM
                Chat
            LEFT JOIN
                pembeli ON Chat.id_pembeli = pembeli.id_pembeli
            LEFT JOIN
                kurir ON Chat.id_kurir = kurir.id_kurir
            WHERE
                kurir.id_kurir = :id_kurir
            ORDER BY
                Chat.id_pembeli ASC;
            `,
            {
                replacements: { id_kurir: id_kurir },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getMessagesByKurirAndPembeli(id_kurir, id_pembeli, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
                Chat.*,
                pembeli.nama_lengkap,
                kurir.nama_kurir
            FROM
                Chat
            LEFT JOIN
                pembeli ON Chat.id_pembeli = pembeli.id_pembeli
            LEFT JOIN
                kurir ON Chat.id_kurir = kurir.id_kurir
            WHERE
                kurir.id_kurir = :id_kurir AND pembeli.id_pembeli = :id_pembeli
            `,
            {
                replacements: { id_kurir: id_kurir, id_pembeli: id_pembeli },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

// Send a message
async function sendMessagePembeliKeUMKM(id_pembeli, id_umkm, data, callback) {
    try {
        // const messages = Message.findOne({ where: { id_pembeli : id } });
        // if (!messages){
        //     throw new error('id tidak ditemukan');
        // }
        const newMessage = await Message.create({
            where: { id_pembeli: id_pembeli },
            message: data.message,
            sent_at: data.sent_at,
            is_read: data.is_read,
            id_umkm: id_umkm,
            id_pembeli: id_pembeli,
            id_kurir: null,
            receiver_type: "UMKM",
        });
        callback(null, newMessage);
    } catch (error) {
        callback(error, null);
    }
}

async function sendMessagePembeliKeKurir(id_pembeli, id_kurir, data, callback) {
    try {
        // const messages = Message.findOne({ where: { id_pembeli : id } });
        // if (!messages){
        //     throw new error('id tidak ditemukan');
        // }
        const newMessage = await Message.create({
            where: { id_pembeli: id_pembeli },
            message: data.message,
            sent_at: data.sent_at,
            is_read: data.is_read,
            id_umkm: null,
            id_pembeli: id_pembeli,
            id_kurir: id_kurir,
            receiver_type: "Kurir",
        });
        callback(null, newMessage);
    } catch (error) {
        callback(error, null);
    }
}

async function sendMessageUMKMKePembeli(id_umkm, id_pembeli, data, callback) {
    try {
        // const messages = await Message.findOne({ where: { id_umkm : id } });
        // if (!messages){
        //     throw new Error('id tidak ditemukan');
        // }
        const newMessage = await Message.create({
            where: { id_umkm: id_umkm },
            message: data.message,
            sent_at: data.sent_at,
            is_read: data.is_read,
            id_umkm: id_umkm,
            id_pembeli: id_pembeli,
            id_kurir: null,
            receiver_type: "Pembeli",
        });
        callback(null, newMessage);
    } catch (error) {
        callback(error, null);
    }
}

async function sendMessageKurirKePembeli(id, data, callback) {
    try {
        // const messages = Message.findOne({ where: { id_kurir : id } });
        // if (!messages){
        //     throw new error('id tidak ditemukan');
        // }
        const newMessage = await Message.create({
            where: { id_kurir: id_kurir },
            message: data.message,
            sent_at: data.sent_at,
            is_read: data.is_read,
            id_umkm: null,
            id_pembeli: id_pembeli,
            id_kurir: id_kurir,
            receiver_type: "Pembeli",
        });
        callback(null, newMessage);
    } catch (error) {
        callback(error, null);
    }
}

// Mark a message as read
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
        const result = await Pembeli.findAll(); // Get all pembeli data
        callback(null, result);
    } catch (error) {
        callback(error, null); // Send error if something goes wrong
    }
}

// Get pembeli by ID
async function getPembeliByID(id, callback) {
    try {
        if (!id) {
            throw new Error("ID cannot be empty");
        }

        const pembeli = await Pembeli.findByPk(id);

        if (!pembeli) {
            throw new Error(`Pembeli with ID ${id} not found`);
        }

        callback(null, pembeli); // Send the pembeli data
    } catch (error) {
        callback(error, null);
    }
}

// Add a new pembeli
async function addPembeli(data, callback) {
    try {
        if (
            !data.nama_lengkap ||
            !data.nomor_telepon ||
            !data.username ||
            !data.email ||
            !data.password
        ) {
            throw new Error("Incomplete data");
        }

        const result = await Pembeli.create(data); // Add new pembeli to the table
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

// Update pembeli information
async function updatePembeli(id, data, callback) {
    try {
        if (!id) {
            throw new Error("ID cannot be empty");
        }

        const pembeli = await Pembeli.findByPk(id);

        if (!pembeli) {
            throw new Error(`Pembeli with ID ${id} not found`);
        }

        const updatedPembeli = await pembeli.update(data); // Update pembeli
        callback(null, updatedPembeli);
    } catch (error) {
        callback(error, null);
    }
}

// Delete pembeli
async function deletePembeli(id, callback) {
    try {
        if (!id) {
            throw new Error("ID cannot be empty");
        }

        const pembeli = await Pembeli.findByPk(id);

        if (!pembeli) {
            throw new Error(`Pembeli with ID ${id} not found`);
        }

        await pembeli.destroy(); // Delete pembeli from the table
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
                { model: UMKM, attributes: ["nama_umkm"] },
                { model: Pesanan, attributes: ["kode_pesanan"] },
            ],
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
                { model: UMKM, attributes: ["nama_umkm"] },
                { model: Pesanan, attributes: ["kode_pesanan"] },
            ],
        });
        if (!kurir) {
            return callback(new Error("Kurir not found"), null);
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
            id_pesanan: data.id_pesanan,
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
            return callback(new Error("Kurir not found"), null);
        }
        await kurir.update({
            nama_kurir: data.nama_kurir,
            id_umkm: data.id_umkm,
            id_pesanan: data.id_pesanan,
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
            return callback(new Error("Kurir not found"), null);
        }
        await kurir.destroy();
        callback(null, { message: "Kurir deleted successfully" });
    } catch (error) {
        callback(error, null);
    }
}

async function getDailyStatsByUMKM(umkmId, month, year) {
    try {
        const result = await sequelize.query(
            `
        SELECT
            r.tanggal AS tanggal,
            SUM(k.kuantitas * prod.Harga) AS total_sales,
            COUNT(DISTINCT pes.id_pesanan) AS total_orders
        FROM
            pesanan pes
        JOIN
            keranjang k ON pes.id_keranjang = k.id_keranjang
        JOIN
            Produk prod ON k.id_produk = prod.id_produk
        JOIN
            riwayat r ON pes.id_pesanan = r.id_pesanan
        WHERE
            prod.ID_UMKM = :umkmId
            AND MONTH(r.tanggal) = :month
            AND YEAR(r.tanggal) = :year
        GROUP BY
            r.tanggal
        ORDER BY
            r.tanggal;
        `,
            {
                replacements: { umkmId, month, year },
                type: QueryTypes.SELECT,
            }
        );

        return result;
    } catch (error) {
        console.error("Error fetching daily stats:", error);
        throw new Error("Error fetching daily stats: " + error.message);
    }
}

async function getMonthlyStatsByUMKM(umkmId) {
    try {
        const result = await sequelize.query(
            `
    SELECT 
        MONTH(r.tanggal) AS month,
        SUM(k.kuantitas * p.Harga) AS total_sales,
        COUNT(DISTINCT r.id_riwayat) AS total_orders
    FROM 
        riwayat r
    JOIN 
        pesanan ps ON r.id_pesanan = ps.id_pesanan  -- Correct join to pesanan
    JOIN 
        keranjang k ON ps.id_keranjang = k.id_keranjang  -- Join keranjang to pesanan
    JOIN 
        Produk p ON k.id_produk = p.id_produk
    WHERE 
        p.ID_UMKM = :umkmId
    GROUP BY 
        MONTH(r.tanggal)
    ORDER BY 
        month;
        `,
            {
                replacements: { umkmId },
                type: QueryTypes.SELECT,
            }
        );

        return result; // Return the result instead of using a callback
    } catch (error) {
        console.error("Error fetching monthly stats:", error);
        throw new Error("Error fetching monthly stats: " + error.message);
    }
}

async function getRiwayat(callback) {
    try {
        const result = await Riwayat.findAll();
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

// Query Dapa
async function getdatadashboardproduklaris(id, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT TOP 1
    p.nama_barang, 
    SUM(k.kuantitas) AS total_kuantitas
FROM 
    Keranjang k
JOIN 
    Produk p ON k.id_produk = p.id_produk
JOIN 
    Pesanan ps ON k.id_keranjang = ps.id_keranjang
WHERE 
    p.id_umkm = :id
GROUP BY 
    p.nama_barang
ORDER BY 
    total_kuantitas DESC;
        `,
            {
                replacements: { id: id },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getdatadashboardpesananmasuk(id, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT 
    COUNT(ps.id_pesanan) AS jumlah_pesanan
FROM 
    pesanan ps
INNER JOIN 
    keranjang k ON ps.id_keranjang = k.id_keranjang
INNER JOIN 
    produk p ON k.id_produk = p.id_produk
INNER JOIN 
    pembeli pb ON k.id_pembeli = pb.id_pembeli
WHERE 
    ps.status_pesanan = 'Pesanan Masuk' 
    AND p.id_umkm = :id;
        `,
            {
                replacements: { id: id },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getdatadashboardprodukpalingbaru(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak ditemukan di parameter");
        }

        const umkm = await UMKM.findByPk(id);
        if (!umkm) {
            throw new Error("UMKM tidak ditemukan");
        }

        const result = await Produk.findAll({
            where: { id_umkm: id },
            order: [["id_produk", "DESC"]],
            limit: 1,
        });

        callback(null, result);
    } catch (error) {
        console.error(error);
        callback(error, null);
    }
}

async function getdatadashboardpesanpalingbaru(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak ditemukan di parameter");
        }

        const umkm = await UMKM.findByPk(id);
        if (!umkm) {
            throw new Error("UMKM tidak ditemukan");
        }

        const result = await Message.findAll({
            where: { id_umkm: id, is_read: 0 },
            order: [["id_chat", "DESC"]],
            limit: 1,
        });

        callback(null, result);
    } catch (error) {
        console.error(error);
        callback(error, null);
    }
}

async function getpesanread(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak ditemukan di parameter");
        }

        const umkm = await UMKM.findByPk(id);
        if (!umkm) {
            throw new Error("UMKM tidak ditemukan");
        }

        const result = await Message.findAll({
            where: { id_umkm: id, is_read: 1 },
        });

        callback(null, result);
    } catch (error) {
        console.error(error);
        callback(error, null);
    }
}

async function getdatadashboardcampaignpalingbaru(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak ditemukan di parameter");
        }

        const umkm = await UMKM.findByPk(id);
        if (!umkm) {
            throw new Error("UMKM tidak ditemukan");
        }

        const result = await Campaign.findAll({
            where: { id_umkm: id },
            order: [["id_campaign", "DESC"]],
            limit: 1,
        });

        callback(null, result);
    } catch (error) {
        console.error(error);
        callback(error, null);
    }
}

async function getpesananmasuk(id, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
			id_pesanan ,
			status_pesanan,
            p.Nama_Barang AS nama_barang,
            k.kuantitas as kuantitas_barang,
			total_belanja,
            pb.alamat AS alamat_pembeli
            FROM pesanan ps
            INNER JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
            INNER JOIN produk p ON k.id_produk = p.id_produk
            INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
			WHERE ps.status_pesanan = 'Pesanan Masuk'
            AND p.id_umkm = :id;
        `,
            {
                replacements: { id: id },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getpesananditerima(id, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
			id_pesanan ,
			status_pesanan,
            p.Nama_Barang AS nama_barang,
            k.kuantitas as kuantitas_barang,
			total_belanja,
            pb.alamat AS alamat_pembeli
            FROM pesanan ps
            INNER JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
            INNER JOIN produk p ON k.id_produk = p.id_produk
            INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
			WHERE ps.status_pesanan = 'Pesanan Diterima'
            AND p.id_umkm = :id;
        `,
            {
                replacements: { id: id },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getpesananditolak(id, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
			id_pesanan ,
			status_pesanan,
            p.Nama_Barang AS nama_barang,
            k.kuantitas as kuantitas_barang,
			total_belanja,
            pb.alamat AS alamat_pembeli
            FROM pesanan ps
            INNER JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
            INNER JOIN produk p ON k.id_produk = p.id_produk
            INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
			WHERE ps.status_pesanan = 'Pesanan Ditolak'
            AND p.id_umkm = :id;
        `,
            {
                replacements: { id: id },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getpesananselesai(id, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
			id_pesanan ,
			status_pesanan,
            p.Nama_Barang AS nama_barang,
            k.kuantitas as kuantitas_barang,
			total_belanja,
            pb.alamat AS alamat_pembeli
            FROM pesanan ps
            INNER JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
            INNER JOIN produk p ON k.id_produk = p.id_produk
            INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
			WHERE ps.status_pesanan = 'Pesanan Selesai'
            AND p.id_umkm = :id;
        `,
            {
                replacements: { id: id },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getriwayatpesanan(id, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
			tanggal as Tanggal_Pesanan,
            p.Nama_Barang AS nama_barang,
            ps.total_belanja AS total_harga,
            ps.status_pesanan,
            pb.alamat AS alamat_pembeli,
            p.Deskripsi_Barang AS deskripsi_barang,
            k.kuantitas as kuantitas_barang,
            p.image_url
            FROM riwayat r
            INNER JOIN pesanan ps ON r.id_pesanan = ps.id_pesanan
            INNER JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
            INNER JOIN produk p ON k.id_produk = p.id_produk
            INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
            WHERE pb.id_pembeli = :id;
        `,
            {
                replacements: { id: id },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getallpesananaktifpembeli(id, callback) {
    try {
        const result = await sequelize.query(
            `
            SELECT
    ps.id_pesanan,
    ps.status_pesanan,
    p.nama_barang,
    k.kuantitas AS kuantitas_barang,
    ps.total_belanja,
    pb.alamat AS alamat_pembeli,
	ps.id_keranjang,
	k.id_pembeli,
    p.image_url
FROM
    pesanan ps
INNER JOIN
    keranjang k ON ps.id_keranjang = k.id_keranjang
INNER JOIN
    produk p ON k.id_produk = p.id_produk
INNER JOIN
    pembeli pb ON k.id_pembeli = pb.id_pembeli
WHERE
    pb.id_pembeli = 1
    AND ps.status_pesanan != 'Pesanan Selesai';
        `,
            {
                replacements: { id: id },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function addpesanan(data, callback) {
    try {
        if (!data.total_belanja || !data.id_keranjang) {
            throw new Error("Incomplete data");
        }
        const result = await Pesanan.create({
            status_pesanan: "Pesanan Masuk",
            total_belanja: data.total_belanja,
            id_keranjang: data.id_keranjang,
        });
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function addriwayat(data, callback) {
    try {
        if (!data.tanggal || !data.id_pesanan || !data.id_umkm) {
            throw new Error("Incomplete data");
        }

        const result = await Riwayat.create(data);
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function updatestatuspesananmasuk(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak boleh kosong");
        }

        const pesanan = await Pesanan.findByPk(id);

        if (!pesanan) {
            throw new Error("produk tidak ditemukan");
        }

        const updatestatus = await pesanan.update({
            status_pesanan: "Pesanan Masuk",
        });

        callback(null, updatestatus);
    } catch (error) {
        callback(error, null);
    }
}

async function updatestatuspesananditerima(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak boleh kosong");
        }

        const pesanan = await Pesanan.findByPk(id);

        if (!pesanan) {
            throw new Error("produk tidak ditemukan");
        }

        const updatestatus = await pesanan.update({
            status_pesanan: "Pesanan Diterima",
        });

        callback(null, updatestatus);
    } catch (error) {
        callback(error, null);
    }
}

async function updatestatuspesananditolak(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak boleh kosong");
        }

        const pesanan = await Pesanan.findByPk(id);

        if (!pesanan) {
            throw new Error("produk tidak ditemukan");
        }

        const updatestatus = await pesanan.update({
            status_pesanan: "Pesanan Ditolak",
        });

        callback(null, updatestatus);
    } catch (error) {
        callback(error, null);
    }
}

async function updatestatuspesananselesai(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak boleh kosong");
        }

        const pesanan = await Pesanan.findByPk(id);

        if (!pesanan) {
            throw new Error("produk tidak ditemukan");
        }

        const updatestatus = await pesanan.update({
            status_pesanan: "Pesanan Selesai",
        });

        callback(null, updatestatus);
    } catch (error) {
        callback(error, null);
    }
}

async function updatepasswordpembeli(email, newPassword, callback) {
    try {
        const result = await Pembeli.update(
            { password: newPassword },
            { where: { email } }
        );

        if (result[0] === 0) {
            return {
                success: false,
                message: "Email Tidak ditemukan atau password salah",
            };
        }
        callback(null, result);
    } catch (error) {
        console.error("Error updating password:", error);
        return { success: false, message: "Ada kesalahan saat mengganti email" };
    }
}

async function updatedataumkm(id, data, callback) {
    try {
        if (!id) {
            throw new Error("id tidak boleh kosong");
        }

        const umkm = await UMKM.findByPk(id);

        if (!umkm) {
            throw new Error("UMKM Tidak ditemukan");
        }
        const result = await umkm.update(data);

        callback(null, result);
    } catch (error) {
        console.error("Error updating password:", error);
        return { success: false, message: "Ada kesalahan saat mengganti Password" };
    }
}

async function getprofileumkm(id, callback) {
    try {
        if (!id) {
            throw new Error("id tidak boleh kosong");
        }

        const umkm = await UMKM.findByPk(id);

        if (!umkm) {
            throw new Error("UMKM Tidak ditemukan");
        }

        callback(null, umkm);
    } catch (error) {
        console.error("Error updating password:", error);
        return { success: false, message: "Ada kesalahan saat mengganti Password" };
    }
}

async function getBlobUrl(containerName, blobName) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    return blobClient.url;
}

async function uploadFileToBlob(
    containerName,
    fileBuffer,
    blobName,
    contentType
) {
    try {
        // Pastikan container ada
        const containerClient = blobServiceClient.getContainerClient(containerName);
        await containerClient.createIfNotExists();
        console.log(`Container "${containerName}" sudah tersedia.`);

        // Buat blob client
        const blobClient = containerClient.getBlockBlobClient(blobName);

        // Unggah file dari buffer
        await blobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: contentType },
        });
        console.log(`File berhasil diunggah ke "${blobName}".`);

        // Kembalikan URL blob
        return blobClient.url;
    } catch (error) {
        console.error("Terjadi kesalahan saat mengunggah file:", error.message);
        throw error;
    }
}

// End Query Dapa

//start query inbox pesanan
async function getinboxpesanan(callback) {
    try {
        const result = await sequelize.query(
            `
         SELECT
    pesanan.id_pesanan,
    pembeli.nama_lengkap,
    produk.Nama_Barang,
    keranjang.kuantitas AS quantity,
    pesanan.status_pesanan
    FROM pesanan
    JOIN keranjang ON pesanan.id_keranjang = keranjang.id_keranjang
    JOIN pembeli ON keranjang.id_pembeli = pembeli.id_pembeli
    JOIN produk ON keranjang.id_produk = produk.id_produk;


        `,
            {
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result);
    } catch (error) {
        callback(error, null);
        console.error("Error executing raw query:", error);
        throw new Error("Query execution failed");
    }
}

async function getCampaign(id) {
    try {
        const campaigns = await Campaign.findAll({ where: { id_umkm: id } });
        return campaigns;
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
    }
}

async function getCampaignById(id) {
    try {
        const campaigns = await Campaign.findByPk(id);
        return campaigns;
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
    }
}

async function createCampaign(data, callback) {
    try {
        const campaign = await Campaign.create(data);
        callback(null, campaign);
    } catch (error) {
        console.error("Error creating campaign:", error);
        callback(error, null);
    }
}

async function updateCampaign(id_campaign, id_umkm, data, callback) {
    try {
        const campaign = await Campaign.findOne({
            where: { id_campaign: id_campaign, id_umkm: id_umkm },
        });
        if (campaign) {
            await campaign.update(data);
            callback(null, campaign);
        } else {
            callback("Campaign not found", null);
        }
    } catch (error) {
        console.error("Error updating campaign:", error);
        callback(error, null);
    }
}

async function deleteCampaign(id, callback) {
    try {
        const campaign = await Campaign.findOne({ where: { id_campaign: id } });
        if (campaign) {
            await campaign.destroy();
            callback(null, "Campaign deleted successfully");
        } else {
            callback("Campaign not found", null);
        }
    } catch (error) {
        console.error("Error deleting campaign:", error);
        callback(error, null);
    }
}

//end query inbox pesanan

module.exports = {
    getproduk,
    getprodukbyID,
    getprodukbyIDUMKM,
    addproduk,
    updateProduk,
    deleteproduk,
    getkeranjangstandby,
    getkeranjangbyID,
    getallKeranjang,
    addtoKeranjang,
    updatestatuskeranjang,
    getuserUMKMbyID,
    getuserUMKM: getalluserUMKM,
    registUMKM,
    loginUMKM,
    getulasans,
    getulasansByProdukId,
    getOverallRating,
    getMessages,
    getMessagesByUMKM,
    getMessagesByPembeli,
    getMessagesByPembeliAndUMKM,
    getmessagesbyUMKMandPembeli,
    getMessagesByPembeliAndKurir,
    getMessagesByKurirAndPembeli,
    getMessagesByKurir,
    sendMessagePembeliKeUMKM,
    sendMessagePembeliKeKurir,
    sendMessageUMKMKePembeli,
    sendMessageKurirKePembeli,
    markMessageAsRead,
    deleteMessage,
    getPembeli,
    getPembeliByID,
    addPembeli,
    updatePembeli,
    deletePembeli,
    getpesananmasuk,
    getriwayatpesanan,
    addriwayat,
    getKurir,
    getKurirByID,
    addKurir,
    updateKurir,
    deleteKurir,
    getpesananmasuk,
    getDailyStatsByUMKM,
    getMonthlyStatsByUMKM,
    getRiwayat,
    getProdukByType,
    addpesanan,
    getpesananditerima,
    getpesananditolak,
    getpesananselesai,
    updatestatuspesananditerima,
    updatestatuspesananditolak,
    updatestatuspesananselesai,
    updatestatuspesananmasuk,
    updatepasswordpembeli,
    updatedataumkm,
    getprofileumkm,
    getinboxpesanan,
    getBlobUrl,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    uploadFileToBlob,
    getdatadashboardproduklaris,
    getdatadashboardpesananmasuk,
    getdatadashboardprodukpalingbaru,
    getdatadashboardpesanpalingbaru,
    getdatadashboardcampaignpalingbaru,
    getCampaignById,
    getallpesananaktifpembeli,
};
