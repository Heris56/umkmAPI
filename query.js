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
const Bookmark = require("./models/bookmark");
const { QueryTypes, where } = require("sequelize");
const sequelize = require("./db");
const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
const fs = require("fs");
const { error } = require("console");
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

// Bookmark/wishlist - Haikal
async function ViewAllBookmark() {
    try {
        bookmark = await Bookmark.findAll();
        return bookmark;
    } catch (error) {
        return { error: error.message }
    }
}

async function ViewBookmarkbyIDPembeli(id_pembeli) {
    try {
        pembeli = await Pembeli.findOne({ where: { id_pembeli } });
        if (!pembeli) {
            return { error: "Tidak menemukan Pembeli", status: 404 }
        }

        bookmark = await Bookmark.findAll({
            where: { id_pembeli },
            include: [{
                model: Produk,
                attributes: ['nama_barang', 'harga', 'image_url']
            }]
        })

        if (bookmark.length === 0) {
            return { message: "bookmark kosong", status: 200 }
        }

        return bookmark;
    } catch (error) {
        return { error: error.message }
    }
}

async function BookmarkedbyPembeli(id_produk, id_pembeli) {
    try {
        pembeli = await Pembeli.findOne({ where: { id_pembeli } });

        if (!pembeli) {
            return { error: "tidak menemukan pembeli", status: 404 }
        }

        produk = await Produk.findByPk(id_produk);

        if (!produk) {
            return { error: "Produk Tidak ditemukan", status: 404 }
        }

        bookmarked = await Bookmark.findOne({ where: { id_produk, id_pembeli } })

        return { bookmarked: !!bookmarked, status: 200 }
    }
    catch (error) {
        return { error: error.message }
    }
}

async function addbookmark(id_pembeli, id_produk) {
    try {
        if (!id_pembeli) {
            return { error: 'Tidak ditemukan id pembeli', status: 400 }
        }
        if (!id_produk) {
            return { error: 'tidak ditemukan id produk', status: 400 }
        }
        pembeli = await Pembeli.findOne({ where: { id_pembeli } });
        produk = await Produk.findOne({ where: { id_produk } });

        if (!pembeli) {
            return { error: 'pembeli tidak ditemukan', status: 404 }
        }
        if (!produk) {
            return { error: 'produk tidak ditemukan', status: 404 }
        }

        const findbookmark = await Bookmark.findOne({ where: { id_pembeli, id_produk } })
        if (findbookmark) {
            return { error: 'sudah ada produk di bookmark', status: 200 }
        }

        const bookmark = await Bookmark.create({ id_pembeli, id_produk });
        return { data: bookmark, status: 201 }
    }
    catch (error) {
        throw error;
    }
}

async function DeleteBookmark(id_pembeli, id_produk) {
    try {
        const bookmark = await Bookmark.findOne({ where: { id_pembeli, id_produk } });
        if (!bookmark) {
            return { error: "bookmark tidak ditemukan", status: 404 }
        }

        await bookmark.destroy();
        return { message: "berhasil menghapus bookmark" }
    } catch (error) {
        return { error: error.message }
    }
}
// end of Bookmark/wishlist - Haikal

// bagian keranjang
async function addbatch(id_pembeli, id_batch, data) {
    try {
        if (!id_pembeli) {
            throw new Error('pembeli tidak ditemukan');
        }
        data.id_produk = null;
        data.kuantitas = null;
        data.total = null;
        data.status = "Deleted";
        data.id_pembeli = id_pembeli;
        data.id_batch = id_batch;

        const addbatch = await Keranjang.create(data);

        return addbatch;
    } catch (error) {
        throw error;
    }
}

async function getkeranjangstandby(id_pembeli) {
    try {
        if (!id_pembeli) {
            throw new Error('id pembeli tidak ditemukan');
        }

        const keranjang = await Keranjang.findAll(
            {
                where: { id_pembeli: id_pembeli, status: "Standby" },
                include: {
                    model: Produk,
                    attributes: ["nama_barang", "image_url", "harga", "id_umkm"]
                }
            }
        );


        return keranjang
    } catch (error) {
        throw error;
    }
}

async function getbatchkeranjang(id_pembeli) {
    try {
        if (!id_pembeli) {
            throw new Error('tidak menemukan ID')
        }

        const keranjang = await getkeranjangbyID(id_pembeli).catch(() => []);

        if (!keranjang || keranjang.length === 0) {
            return null;
        }

        const latest_batch = keranjang[keranjang.length - 1].id_batch
        return latest_batch;
    } catch (error) {
        throw error;
    }
}

async function searchproductonKeranjang(id_pembeli, id_produk, id_batch) {
    try {
        if (!id_pembeli) {
            throw new Error('tidak menemukan pembeli');
        }

        const produkkeranjang = await Keranjang.findOne(
            {
                where: {
                    id_pembeli: id_pembeli,
                    id_produk: id_produk,
                    id_batch: id_batch,
                    status: 'Standby'
                }
            }
        )

        const produk = Produk.findByPk(id_produk);


        if (produkkeranjang) {
            return { found: true, data: produkkeranjang }
        } else {
            return { found: false, message: 'tidak menemukan produk di keranjang' }
        }

    } catch (error) {
        throw error;
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

        return result;
    } catch (error) {
        throw error;
    }
}

async function addtoKeranjang(data, callback) {
    try {
        if (!data.kuantitas || !data.id_pembeli || !data.id_produk) {
            throw new Error("Data Harus terisi semua");
        }

        const found = await searchproductonKeranjang(data.id_pembeli, data.id_produk, data.id_batch)

        const same = await CekKeranjang(data.id_pembeli, data.id_produk);

        if (same["same"] === false) {
            callback(null, { message: 'tidak bisa nambah produk umkm yang berbeda' })
        } else if (found['found'] === true) {
            callback(null, { message: 'Barang sudah ada di keranjang' });
        } else {
            data.status = 'Standby'
            const result = await Keranjang.create(data);
            callback(null, {
                message: 'berhasil menambahkan ke keranjang',
                data: result
            });
        }
    } catch (error) {
        callback(error, null);
    }
}

async function updatestatuskeranjang(id) {
    try {
        if (!id) {
            throw new Error("id tidak boleh kosong");
        }

        const updatestatus = await Keranjang.update(
            { status: "Deleted" },
            { where: { id_pembeli: id } }
        );


        return updatestatus;
    } catch (error) {
        throw error;
    }
}

async function plusQTY(id_keranjang) {
    try {
        if (!id_keranjang) {
            throw new Error('gagal mendapatkan keranjang')
        }

        var keranjang = await Keranjang.findByPk(id_keranjang);

        if (!keranjang) {
            throw new Error('keranjang tidak ditemukan')
        }

        var produk = await Produk.findByPk(keranjang.id_produk);

        if (keranjang.kuantitas < produk.stok) {
            keranjang.kuantitas += 1;

            await keranjang.save();
        } else {
            return { message: 'Kuantitas sudah mencapai stok maksimum' }
        }

        return keranjang;
    } catch (error) {
        throw error;
    }
}

async function minQTY(id_keranjang) {
    try {
        if (!id_keranjang) {
            throw new Error('gagal mendapatkan keranjang')
        }

        var keranjang = await Keranjang.findByPk(id_keranjang);

        if (!keranjang) {
            throw new Error('keranjang tidak ditemukan')
        }

        if (keranjang.kuantitas > 1) {
            keranjang.kuantitas -= 1;

            await keranjang.save();
        } else {
            deletekeranjang(id_keranjang);
            return { message: 'Keranjang Dihapus' }
        }

        return keranjang;
    } catch (error) {
        throw error;
    }
}

//fungsi untuk dipanggil di controller/query.js aja
async function deletekeranjang(id_keranjang) {
    try {
        if (!id_keranjang) {
            throw new Error('gagal menemukan keranjang')
        }

        var keranjang = await Keranjang.findByPk(id_keranjang);
        if (!keranjang) {
            throw new Error('keranjang tidak ada');
        }

        await keranjang.destroy();
    } catch (error) {
        throw error;
    }
}

async function CekKeranjang(id_pembeli, id_produk) {
    try {
        if (!id_produk) {
            throw new Error('gagal menemukan produk');
        }

        const keranjang = await getkeranjangstandby(id_pembeli);

        if (!keranjang) {
            return { message: 'kosong' }
        }
        const lastKeranjang = keranjang[keranjang.length - 1];
        if (!lastKeranjang) {
            return { same: true }
        }

        const produk = await Produk.findByPk(id_produk);

        if (!produk) {
            return { same: true }
        }

        if (produk["id_umkm"] === lastKeranjang["Produk"]["id_umkm"]) {
            return { same: true }
        } else {
            return { same: false }
        }

    } catch (error) {
        throw error;
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

async function addulasans(data, callback) {
    try {
        const newUlasan = await Ulasan.create({
            id_pembeli: data.id_pembeli,
            id_produk: data.id_produk,
            username: data.username,
            ulasan: data.ulasan,
            rating: data.rating
        });

        callback(null, newUlasan);
    } catch (error) {
        callback(error, null);
    }
}

async function getulasansByProdukId(id_produk, callback) {
    try {
        const result = await Ulasan.findAll({
            include: [{
                model: Produk,
                where: { id_produk: id_produk },
            },
            {
                model: Pembeli,
                attributes: ['id_pembeli', 'username', 'profileImg'],
            },
            ]
        });
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function getulasansByIdUMKM(id_umkm, callback) {
    try {
        const result = await Ulasan.findAll({
            include: [{
                model: Produk,
                where: { id_umkm: id_umkm },
            },
            {
                model: Pembeli,
                attributes: ['id_pembeli', 'username', 'profileImg'],
            },
            ]
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
                Chat.id_chat ASC;
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
                umkm.id_umkm = :id_umkm AND pembeli.id_pembeli = :id_pembeli
            ORDER BY
                Chat.id_chat ASC;
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

async function getLatestMessageByUMKMandPembeli(id_umkm, id_pembeli, callback) {
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
                umkm.id_umkm = :id_umkm AND pembeli.id_pembeli = :id_pembeli
            ORDER BY
                Chat.id_chat DESC
            LIMIT 1;
        `,
            {
                replacements: { id_umkm: id_umkm, id_pembeli: id_pembeli },
                type: QueryTypes.SELECT,
            }
        );

        callback(null, result.length > 0 ? result[0] : null);
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
                
                Chat.id_chat ASC;
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
             ORDER BY
                 Chat.id_chat ASC;
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
             ORDER BY
                 Chat.id_chat ASC;
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
                 Chat.id_chat ASC;
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
             ORDER BY
                 Chat.id_chat ASC;
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

async function sendMessageKurirKePembeli(id_kurir, id_pembeli, data, callback) {
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
async function markMessageAsRead(id_pembeli, callback) {
    try {
        const query = `
            UPDATE Chat
            SET is_read = 1
            WHERE id_pembeli = :id_pembeli
        `;

        const [result] = await sequelize.query(query, {
            replacements: { id_pembeli: id_pembeli },
            type: sequelize.QueryTypes.UPDATE,
        });

        if (result === 0) {
            throw new Error(
                `Messages for Pembeli with ID ${id_pembeli} not found or already read`
            );
        }

        callback(null, {
            message: `Messages for Pembeli with ID ${id_pembeli} marked as read`,
        });
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

//get

//login pembeli
async function loginPembeli(data, callback) {
    try {
        const pembeli = await Pembeli.findOne({ where: { email: data.email } });
        if (pembeli && pembeli.password === data.password) {
            const result = {
                id_pembeli: pembeli.id_pembeli,
                nama_lengkap: pembeli.nama_lengkap,
                username: pembeli.username,
                nomor_telepon: pembeli.nomor_telepon,
                alamat: pembeli.alamat,
                email: pembeli.email,
                profileImage: pembeli.profileImg,

            }
            callback(null, result);
        } else {
            callback(new Error('Email atau Password salah!'), null);
        };
        return (null, pembeli);
    } catch (error) {
        callback(error, null);
    }
};

// async function logi(email, password, callback) {
//     try {
//         const result = await Pembeli.findAll({
//             where: {email: email, password: password}
//         }); // Get all pembeli data
//         callback(null, result);
//     } catch (error) {
//         callback(error, null); // Send error if something goes wrong
//     }
// }


// Add a new pembeli
async function addPembeli(data, callback) {
    try {
        if (
            !data.nama_lengkap ||
            !data.nomor_telepon ||
            !data.username ||
            !data.email ||
            !data.password ||
            !data.alamat
        ) {
            throw new Error("Incomplete data");
        }

        const result = await Pembeli.create(data);
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
//Check Pembeli kalo pake email atau username
async function checkPembeli(emailInput, usernameInput, callback) {
    try {
        const email = await Pembeli.findOne({ where: { email: emailInput } });
        const username = await Pembeli.findOne({ where: { username: usernameInput } });
        if (email || username) {
            callback(null, { emailExists: !!email, usernameExists: !!username });
        } else {
            callback(null, { emailExists: false, usernameExists: false });
        }
    } catch (error) {
        callback(error, null);
    }
}

async function checkPembeliByEmail(emailInput, callback) {
    try {
        const email = await Pembeli.findOne({ where: { email: emailInput } });
        if (email) {
            callback(null, { emailExists: true });
        } else {
            callback(null, { emailExists: false });
        }
    } catch (error) {
        callback(error, null);
    }
}

async function changePasswordPembeli(email, newPassword, callback) {
    try {
        const user = await Pembeli.findOne({ where: { email: email } });
        if (!user) {
            return callback(new Error("User not found"), null);
        }

        user.password = newPassword;
        await user.save();

        callback(null, { message: "Password changed successfully" });
    } catch (error) {
        callback(error, null);
    }
}

//Check user tapi Pembeli juga cuman pake select from pembeli
async function checkUser(email, username, callback) {
    const query = 'SELECT COUNT(*) AS count FROM pembeli WHERE email = ? OR username = ?';
    db.query(query, [email, username], (error, results) => {
        if (error) {
            return callback(error, null);
        }
        const exists = results[0].count > 0;
        callback(null, { exists });
    });
}


//Query Kurir
// Get all kurir data
async function getKurir(callback) {
    try {
        const result = await Kurir.findAll();
        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

// Get kurir by ID
async function getKurirByID(id, callback) {
    try {
        if (!id) {
            throw new Error("ID cannot be empty");
        }

        const kurir = await Kurir.findByPk(id);

        if (!kurir) {
            throw new Error(`Kurir with ID ${id} not found`);
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
            // id_pesanan: data.id_pesanan,
            email: data.email,
            password: data.password,
        });
        callback(null, newKurir);
    } catch (error) {
        callback(error, null);
    }
}

// Update kurir information
async function updateKurir(id, data, callback) {
    try {
        if (!id) {
            throw new Error("ID cannot be empty");
        }

        const kurir = await Kurir.findByPk(id);

        if (!kurir) {
            throw new Error(`Kurir with ID ${id} not found`);
        }
        await kurir.update({
            nama_kurir: data.nama_kurir,
            id_umkm: data.id_umkm,
            // id_pesanan: data.id_pesanan,
        });
        callback(null, kurir);
    } catch (error) {
        callback(error, null);
    }
}

// Delete kurir
async function deleteKurir(id, callback) {
    try {
        if (!id) {
            throw new Error("ID cannot be empty");
        }

        const kurir = await Kurir.findByPk(id);

        if (!kurir) {
            throw new Error(`Kurir with ID ${id} not found`);
        }

        await kurir.destroy();
        callback(null, { message: `Kurir with ID ${id} has been deleted` });
    } catch (error) {
        callback(error, null);
    }
}

// Login Kurir
async function loginKurir(data, callback) {
    try {
        if (!data.email) {
            return callback(new Error("Email is required"), null);
        }

        const kurir = await Kurir.findOne({
            where: { email: data.email },
        });

        if (kurir && kurir.password === data.password) {
            const result = {
                id_kurir: kurir.id_kurir,
                nama_kurir: kurir.nama_kurir,
                id_umkm: kurir.id_umkm,
                // username: kurir.username,
                // nomor_telepon: kurir.nomor_telepon,
                email: kurir.email,
            };
            callback(null, result);
        } else {
            callback(new Error("Invalid email or password"), null);
        }
    } catch (error) {
        return callback(error, null);
    }
}

//check kurir
async function checkKurir(email, callback) {
    try {
        const result = await Kurir.findOne({ where: { email: email } });
        if (result) {
            callback(null, { exists: true });
        } else {
            callback(null, { exists: false });
        }
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
            riwayat r
        JOIN
            pesanan pes ON r.id_pesanan = pes.id_pesanan
        JOIN
            keranjang k ON pes.id_keranjang = k.id_keranjang
        JOIN
            Produk prod ON k.id_produk = prod.id_produk
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
        COUNT(DISTINCT ps.id_pesanan) AS total_orders
    FROM 
        riwayat r
    JOIN 
        pesanan ps ON r.id_pesanan = ps.id_pesanan
    JOIN 
        keranjang k ON ps.id_keranjang = k.id_keranjang
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

        return result;
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
            SELECT 
    p.nama_barang, 
    SUM(k.kuantitas) AS total_kuantitas
FROM 
    keranjang k
JOIN 
    Produk p ON k.id_produk = p.id_produk
JOIN 
    pesanan ps ON k.id_keranjang = ps.id_keranjang
WHERE 
    p.id_umkm = ?
GROUP BY 
    p.nama_barang
ORDER BY 
    total_kuantitas DESC
LIMIT 1;
        `,
            {
                replacements: [id],
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
    Produk p ON k.id_produk = p.id_produk
INNER JOIN 
    pembeli pb ON k.id_pembeli = pb.id_pembeli
WHERE 
    ps.status_pesanan = 'Pesanan Masuk' 
    AND p.id_umkm = ?;
        `,
            {
                replacements: [id],
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
    k.id_batch,
    MAX(ps.total_belanja) AS total_belanja,
    SUM(k.kuantitas) AS kuantitas,
    STRING_AGG(CAST(p.Nama_Barang AS NVARCHAR(MAX)), ', ') AS nama_barang,
    CAST(ps.status_pesanan AS NVARCHAR(MAX)) AS status_pesanan,
    CAST(pb.alamat AS NVARCHAR(MAX)) AS alamat_pembeli
FROM keranjang k
INNER JOIN pesanan ps ON ps.id_keranjang = k.id_keranjang
INNER JOIN Produk p ON k.id_produk = p.id_produk
INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
WHERE p.id_umkm = :id AND ps.status_pesanan = 'Pesanan Masuk' AND k.id_produk IS NOT NULL
GROUP BY
    k.id_batch,
    CAST(ps.status_pesanan AS NVARCHAR(MAX)),
    CAST(pb.alamat AS NVARCHAR(MAX))
ORDER BY k.id_batch ASC;
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
    k.id_batch,
    MAX(ps.total_belanja) AS total_belanja,
    SUM(k.kuantitas) AS kuantitas,
    GROUP_CONCAT(p.nama_barang SEPARATOR ', ') AS nama_barang, -- Mengganti STRING_AGG dengan GROUP_CONCAT
    ps.status_pesanan,
    pb.alamat AS alamat_pembeli
FROM keranjang k
INNER JOIN pesanan ps ON ps.id_keranjang = k.id_keranjang
INNER JOIN produk p ON k.id_produk = p.id_produk
INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
WHERE p.id_umkm = ? 
  AND ps.status_pesanan = 'Pesanan Diterima' 
  AND k.id_produk IS NOT NULL
GROUP BY
    k.id_batch,
    ps.status_pesanan,
    pb.alamat
ORDER BY k.id_batch ASC;
        `,
            {
                replacements: [id],
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
        k.id_batch,
        MAX(ps.total_belanja) AS total_belanja,
        SUM(k.kuantitas) AS kuantitas,
        GROUP_CONCAT(p.nama_barang SEPARATOR ', ') AS nama_barang, -- Menggunakan GROUP_CONCAT
        ps.status_pesanan,
        pb.alamat AS alamat_pembeli
    FROM keranjang k
    INNER JOIN pesanan ps ON ps.id_keranjang = k.id_keranjang
    INNER JOIN produk p ON k.id_produk = p.id_produk
    INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
    WHERE p.id_umkm = ? 
      AND ps.status_pesanan = 'Pesanan Ditolak' 
      AND k.id_produk IS NOT NULL
    GROUP BY
        k.id_batch,
        ps.status_pesanan,
        pb.alamat
    ORDER BY k.id_batch ASC;
        `,
            {
                replacements: [id],
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
    k.id_batch,
    MAX(ps.total_belanja) AS total_belanja,
    SUM(k.kuantitas) AS kuantitas,
    GROUP_CONCAT(p.nama_barang SEPARATOR ', ') AS nama_barang, -- Menggunakan GROUP_CONCAT untuk menggantikan STRING_AGG
    ps.status_pesanan,
    pb.alamat AS alamat_pembeli
FROM keranjang k
INNER JOIN pesanan ps ON ps.id_keranjang = k.id_keranjang
INNER JOIN produk p ON k.id_produk = p.id_produk
INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
WHERE p.id_umkm = ? 
  AND ps.status_pesanan = 'Pesanan Selesai' 
  AND k.id_produk IS NOT NULL
GROUP BY
    k.id_batch,
    ps.status_pesanan,
    pb.alamat
ORDER BY k.id_batch ASC;
        `,
            {
                replacements: [id],
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
    k.id_batch,
    MAX(r.tanggal) AS Tanggal_Pesanan,
    GROUP_CONCAT(p.nama_barang SEPARATOR ', ') AS nama_barang, -- Menggunakan GROUP_CONCAT sebagai pengganti STRING_AGG
    MAX(ps.total_belanja) AS total_harga,
    MAX(ps.status_pesanan) AS status_pesanan,
    MAX(pb.alamat) AS alamat_pembeli,
    GROUP_CONCAT(k.kuantitas SEPARATOR ', ') AS kuantitas_barang,
    GROUP_CONCAT(p.image_url SEPARATOR ', ') AS image_url
FROM riwayat r
INNER JOIN pesanan ps ON r.id_pesanan = ps.id_pesanan
INNER JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
INNER JOIN produk p ON k.id_produk = p.id_produk
INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
WHERE pb.id_pembeli = ? AND k.id_produk IS NOT NULL
GROUP BY k.id_batch
ORDER BY k.id_batch;
        `,
            {
                replacements: [id],
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
    k.id_batch,
    GROUP_CONCAT(p.nama_barang SEPARATOR ', ') AS nama_barang, -- Menggabungkan nama barang
    MAX(ps.status_pesanan) AS status_pesanan, -- Mengambil salah satu nilai status_pesanan
    GROUP_CONCAT(k.kuantitas SEPARATOR ', ') AS kuantitas_barang, -- Menggabungkan kuantitas dalam satu kolom
    MAX(ps.total_belanja) AS total_belanja,
    MAX(pb.alamat) AS alamat_pembeli, -- Mengambil alamat pembeli
    MAX(ps.id_keranjang) AS id_keranjang, -- Mengambil salah satu id_keranjang
    k.id_pembeli,
    GROUP_CONCAT(p.image_url SEPARATOR ', ') AS image_url -- Menggabungkan URL gambar
FROM pesanan ps
INNER JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
INNER JOIN produk p ON k.id_produk = p.id_produk
INNER JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
WHERE pb.id_pembeli = ? 
    AND ps.status_pesanan != 'Pesanan Selesai'
GROUP BY k.id_batch, k.id_pembeli, pb.alamat
ORDER BY k.id_batch;
        `,
            {
                replacements: [id],
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

async function getkeranjangbyidbatch(id_pembeli, id_batch, callback) {
    try {
        const result = await sequelize.query(
            `
            	SELECT
    k.id_keranjang,
    k.total,
    k.kuantitas,
    k.status,
    k.id_pembeli,
    k.id_produk,
    k.id_batch,
    p.nama_barang,
    p.harga,
    p.image_url,
    pb.nama_lengkap AS nama_pembeli
FROM keranjang k
JOIN produk p ON k.id_produk = p.id_produk
JOIN pembeli pb ON k.id_pembeli = pb.id_pembeli
WHERE k.id_batch = ? 
    AND k.id_pembeli = ?;
        `,
            {
                replacements: [id_batch, id_pembeli],
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


async function addpesanan(id_keranjang, total_belanja, id_pembeli, callback) {
    try {
        if (!id_keranjang || !total_belanja) {
            throw new Error("Data tidak lengkap");
        }

        const pesananBaru = await Pesanan.create({ id_keranjang: id_keranjang, total_belanja: total_belanja, status_pesanan: "Pesanan Masuk" });
        updatestatuskeranjang(id_pembeli);

        callback(null, pesananBaru);
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

async function updatestatuspesananmasuk(id_umkm, id_batch, callback) {
    try {
        const query = `
            UPDATE pesanan ps
JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
JOIN produk p ON k.id_produk = p.id_produk
SET ps.status_pesanan = 'Pesanan Masuk'
WHERE k.id_batch = ? 
  AND p.id_umkm = ?;
        `;

        const [result] = await sequelize.query(query, {
            replacements: [id_batch, id_umkm],
            type: sequelize.QueryTypes.UPDATE,
        });


        if (result === 0) {
            throw new Error('Update Gagal');
        }

        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function updatestatuspesananditerima(id_umkm, id_batch, callback) {
    try {
        const query = `
            UPDATE pesanan ps
JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
JOIN produk p ON k.id_produk = p.id_produk
SET ps.status_pesanan = 'Pesanan Diterima'
WHERE k.id_batch = ? 
  AND p.id_umkm = ?;
        `;

        const [result] = await sequelize.query(query, {
            replacements: [id_batch, id_umkm],
            type: sequelize.QueryTypes.UPDATE,
        });


        if (result === 0) {
            throw new Error('Update Gagal');
        }

        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function updatestatuspesananditolak(id_umkm, id_batch, callback) {
    try {
        const query = `
            UPDATE pesanan ps
JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
JOIN produk p ON k.id_produk = p.id_produk
SET ps.status_pesanan = 'Pesanan Ditolak'
WHERE k.id_batch = ? 
  AND p.id_umkm = ?;
        `;

        const [result] = await sequelize.query(query, {
            replacements: [id_batch, id_umkm],
            type: sequelize.QueryTypes.UPDATE,
        });


        if (result === 0) {
            throw new Error('Update Gagal');
        }

        callback(null, result);
    } catch (error) {
        callback(error, null);
    }
}

async function updatestatuspesananselesai(id_umkm, id_batch, callback) {
    try {
        const query = `
            UPDATE pesanan ps
JOIN keranjang k ON ps.id_keranjang = k.id_keranjang
JOIN produk p ON k.id_produk = p.id_produk
SET ps.status_pesanan = 'Pesanan Selesai'
WHERE k.id_batch = ? 
  AND p.id_umkm = ?;
        `;

        const [result] = await sequelize.query(query, {
            replacements: { id_batch: id_batch, id_umkm: id_umkm },
            type: sequelize.QueryTypes.UPDATE,
        });


        if (result === 0) {
            throw new Error('Update Gagal');
        }

        callback(null, result);
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
    Produk.Nama_Barang,
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
    searchproductonKeranjang,
    getbatchkeranjang,
    getkeranjangstandby,
    getkeranjangbyID,
    getallKeranjang,
    addbatch,
    addtoKeranjang,
    plusQTY,
    minQTY,
    CekKeranjang,
    updatestatuskeranjang,
    ViewAllBookmark,
    ViewBookmarkbyIDPembeli,
    addbookmark,
    BookmarkedbyPembeli,
    DeleteBookmark,
    getuserUMKMbyID,
    getuserUMKM: getalluserUMKM,
    registUMKM,
    loginUMKM,
    getulasans,
    addulasans,
    getulasansByProdukId,
    getulasansByIdUMKM,
    getOverallRating,
    getMessages,
    getMessagesByUMKM,
    getMessagesByPembeli,
    getMessagesByPembeliAndUMKM,
    getmessagesbyUMKMandPembeli,
    getLatestMessageByUMKMandPembeli,
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
    loginPembeli,
    loginKurir,
    checkPembeli,
    checkUser,
    checkKurir,
    getallpesananaktifpembeli,
    getkeranjangbyidbatch,
    checkPembeliByEmail,
    changePasswordPembeli
};
