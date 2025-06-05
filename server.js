// server.js
const express = require("express");
const dboperations = require("./query");
const { v4: uuidv4 } = require('uuid');
const R2upload = require("./R2Services")
const Kurir = require("./models/kurir");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/message");
const Ulasan = require("./models/ulasan");
const { error } = require("console");

// otp things
const sgMail = require('@sendgrid/mail');
if (!process.env.EMAIL_FROM) {
    console.error('EMAIL_FROM belum diatur di .env!');
    return res.status(500).json({ error: 'Server error: Email pengirim belum dikonfigurasi' });
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://umkmkuapi.com", "http://127.0.0.1:8000", "*"],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // Listen for new messages
    socket.on("sendMessage", async (data) => {
        try {
            // Save the message in the database
            const newMessage = await Message.create({
                id_umkm: data.id_umkm,
                id_pembeli: data.id_pembeli,
                message: data.message,
                is_read: false,
                receiver_type: data.receiver_type,
            });

            // Emit the new message to all connected clients
            io.emit("newMessage", newMessage); // Broadcast to all clients
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

    // socket.on("receiveMessage", async (data) => {
    //   try {
    //     // Save the received message in the database
    //     const receivedMessage = await Message.create({
    //       id_umkm: data.id_umkm,
    //       id_pembeli: data.id_pembeli,
    //       message: data.message,
    //       is_read: false,
    //       receiver_type: data.receiver_type,
    //     });

    //     // Emit the message back to the sender and receiver
    //     io.to(data.id_umkm)
    //       .to(data.id_pembeli)
    //       .emit("newMessage", receivedMessage);
    //   } catch (error) {
    //     console.error("Error receiving message:", error);
    //   }
    // });


    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});



// const corsOptions = {
//     origin: 'http://127.0.0.1:8000/',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// };
// app.use(cors(corsOptions));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 80;

app.use(express.json());
app.use("/otp", require("./route/routes"));

// Konfigurasi multer untuk file upload
const storage = multer.memoryStorage(); // Simpan file di memori (buffer)
const upload = multer({ storage });

app.get("/", (req, res) => {
    res.json({ message: "hello world" });
});

app.post('/uploadfile', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "Tidak ada file yang diupload" });
        }

        console.log('MIME Type:', file.mimetype);

        const fileExtension = path.extname(file.originalname);
        const oriName = file.originalname;
        const uniqueFileName = `${uuidv4()}-${oriName}`

        const bucketName = process.env.R2_BUCKETNAME;
        const fileContent = file.buffer;
        const mimetype = file.mimetype;

        await R2upload.uploadfile(bucketName, uniqueFileName, fileContent, mimetype);

        res.status(200).json({ message: "File Berhasil di Upload", fileName: uniqueFileName, url: `https://umkmkuapi.com/${uniqueFileName}` });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Gagal upload file' });
    }
});

app.get("/produk/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getprodukbyID(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        return res.json(result);
    });
});

app.get("/produk", (req, res) => {
    dboperations.getproduk((error, result) => {
        if (error) {
            console.error("error get Produk:", error);
            return res.status(500).send("error fetch Produk");
        }
        return res.json(result);
    });
});

app.get("/produkumkm/:id", async (req, res) => {
    const id_umkm = req.params.id;
    dboperations.getprodukbyIDUMKM(id_umkm, (error, result) => {
        if (error) {
            console.error("error: ", error);
            return res.status(500).send(error);
        }
        res.status(200).json(result);
    });
});

app.post("/Produk", (req, res) => {
    const data = req.body;
    dboperations.addproduk(data, (error, result) => {
        if (error) {
            console.error("error insert Produk:", error);
            return res.status(500).send("error nambah Produk");
        }
        res.status(200).json(result);
    });
});

app.put("/updateproduk/:id", (req, res) => {
    const id = req.params.id;
    const data = req.body;
    dboperations.updateProduk(id, data, (error, result) => {
        if (error) {
            console.error("error update Produk:", error);
            return res.status(500).send("gagal meng-update Produk");
        }
        res.status(200).json(result);
    });
});

app.get("/produkbytipe/tipe", async (req, res) => {
    // Extract 'tipe_barang' from query parameters
    const { tipe_barang } = req.query;

    console.log("tipe_barang:", tipe_barang);

    // Validate that tipe_barang is provided
    if (!tipe_barang) {
        return res.status(400).send('Parameter "tipe_barang" is required.');
    }

    // Call the updated function with the parameter
    dboperations.getProdukByType(tipe_barang, (error, result) => {
        if (error) {
            console.error("Error getting Produk:", error);
            return res.status(500).send("Error fetching Produk");
        }
        res.json(result);
    });
});

// bookmark
app.get("/bookmark/:id_pembeli", async (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    try {
        const bookmark = await dboperations.ViewBookmarkbyIDPembeli(id_pembeli)
        if (bookmark.error) {
            return res.status(404).json(bookmark);
        }

        return res.status(200).json(bookmark);
    } catch (error) {
        res.status(500).json({ error: `${error.message}` })
    }
})

app.get("/bookmark", async (req, res) => {
    try {
        const bookmark = await dboperations.ViewAllBookmark();
        return res.status(200).json(bookmark);
    } catch (error) {
        res.status(500).json({ error: `${error.message}` })
    }
});

app.get("/bookmark/check/:id_produk/:id_pembeli", async (req, res) => {
    const id_produk = req.params.id_produk;
    const id_pembeli = req.params.id_pembeli;
    try {
        const bookmarked = await dboperations.BookmarkedbyPembeli(id_produk, id_pembeli);
        return res.status(bookmarked.status).json(bookmarked);
    }
    catch (error) {
        res.status(500).json({ error: `${error.message}` });
    }
});

app.post("/bookmark/:id_pembeli/:id_produk", async (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    const id_produk = req.params.id_produk;
    try {
        const bookmark = await dboperations.addbookmark(id_pembeli, id_produk);
        if (bookmark.error) {
            return res.status(bookmark.status).json({ Message: bookmark.error });
        }

        res.status(201).json({ Message: "Berhasil menambahkan bookmark", data: bookmark.data })
    } catch (error) {
        res.status(500).json({ error: `${error.message}` })
    }
});

app.delete("/bookmark/:id_pembeli/:id_produk", async (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    const id_produk = req.params.id_produk;
    try {
        const deletedbookmark = await dboperations.DeleteBookmark(id_pembeli, id_produk);
        if (deletedbookmark.error) {
            return res.status(404).json(deletedbookmark);
        }

        return res.status(200).json(deletedbookmark);
    } catch (error) {
        res.status(500).json({ error: `${error.message}` })
    }
})
// end of bookmark

// Start of Search

app.get("/search", async (req, res) => {
    try {
        const searchquery = req.query.search || "";
        const result = await dboperations.SearchProduct(searchquery);

        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/search/:id_umkm", async (req, res) => {
    try {
        const id_umkm = req.params.id_umkm;
        const searchquery = req.query.search || "";
        const result = await dboperations.SearchOwnProduct(searchquery, id_umkm);

        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// End of search

// keranjang
app.post("/keranjang", (req, res) => {
    const data = req.body;
    dboperations.addtoKeranjang(data, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(400).send({ message: error.message || "Terjadi kesalahan" });
        }
        return res.json(result).status(200);
    });
});

app.get("/cekcart/:id_pembeli/:id_produk", async (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    const id_produk = req.params.id_produk;
    try {
        const found = await dboperations.CekKeranjang(id_pembeli, id_produk);
        res.status(200).json(found);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// app.put("/order/:id_pembeli", (req, res) => {
//     const id_pembeli = req.params.id_pembeli
//     dboperations.(id_pembeli, (error, result) => {
//         if (error) {
//             console.error(error);
//             return res.status(500).send('gagal order pesanan:');
//         }
//         res.json(result).status(200);
//     });
// });

app.put('/keranjangplus/:id_keranjang', async (req, res) => {
    try {
        const id_keranjang = req.params.id_keranjang;

        const result = await dboperations.plusQTY(id_keranjang);

        if (result.message) {
            // Jika kuantitas sudah mencapai stok maksimum
            res.status(200).json({
                message: result.message
            });
        } else {
            // Jika kuantitas berhasil ditambah
            res.status(200).json({
                message: 'Kuantitas berhasil ditambah',
                data: result
            });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/keranjangmin/:id_keranjang', async (req, res) => {
    try {
        const id_keranjang = req.params.id_keranjang;
        const updatedKeranjang = await dboperations.minQTY(id_keranjang);
        if (updatedKeranjang.message) {
            // delete keranjang
            res.status(200).json({ message: updatedKeranjang.message });
        } else {
            res.status(200).json({
                // ngurangin qty di keranjang
                message: 'Kuantitas berhasil dikurangi',
                data: updatedKeranjang
            });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post("/addbatch/:id_pembeli/:id_batch", async (req, res) => {
    const { id_pembeli, id_batch } = req.params; // Mengambil id_pembeli dan id_batch dari URL

    try {
        // Memanggil fungsi addbatch dengan data default
        const result = await dboperations.addbatch(id_pembeli, id_batch, {});

        res.status(201).json({
            message: "Batch berhasil ditambahkan",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

app.get("/lastbatch/:id_pembeli", async (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    try {
        const latest_batch = await dboperations.getbatchkeranjang(id_pembeli);
        res.status(200).json({ latest_batch });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

app.get("/keranjangstandby/:id_pembeli", async (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    try {
        const keranjangstandby = await dboperations.getkeranjangstandby(id_pembeli);
        res.status(200).json(keranjangstandby);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.get("/searchkeranjang/:id_pembeli/:id_produk/:id_batch", async (req, res) => {
    const { id_pembeli, id_produk, id_batch } = req.params;

    try {
        const foundkeranjang = await dboperations.searchproductonKeranjang(id_pembeli, id_produk, id_batch);
        res.status(200).json(foundkeranjang);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/keranjang", (req, res) => {
    dboperations.getallKeranjang((error, result) => {
        if (error) {
            console.error(error)
            return res.status(500).send("error memasukan ke keranjang");
        }
        res.json(result).status(200);
        console.log("berhasil mendapatkan semua keranjang");
    });
});

app.get("/keranjang/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const keranjangid = await dboperations.getkeranjangbyID(id);
        res.status(200).json(keranjangid);
    } catch (error) {
        res.status(500).json({ error: `${error.message}` })
    }
});

// end of keranjang

// bookmark
app.get("/bookmark/:id_pembeli", async (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    try {
        const bookmark = await dboperations.ViewBookmarkbyIDPembeli(id_pembeli)
        if (bookmark.error) {
            return res.status(404).json(bookmark);
        }

        return res.status(200).json(bookmark);
    } catch (error) {
        res.status(500).json({ error: `${error.message}` })
    }
})

app.get("/bookmark", async (req, res) => {
    try {
        const bookmark = await dboperations.ViewAllBookmark();
        return res.status(200).json(bookmark);
    } catch (error) {
        res.status(500).json({ error: `${error.message}` })
    }
});

app.post("/bookmark/:id_pembeli/:id_produk", async (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    const id_produk = req.params.id_produk;
    try {
        const bookmark = await dboperations.addbookmark(id_pembeli, id_produk);
        if (bookmark.error) {
            return res.status(bookmark.status).json({ Message: bookmark.error });
        }

        res.status(201).json({ Message: "Berhasil menambahkan bookmark", data: bookmark.data })
    } catch (error) {
        res.status(500).json({ error: `${error.message}` })
    }
});

app.delete("/bookmark/:id_bookmark", async (req, res) => {
    const id_bookmark = req.params.id_bookmark;
    try {
        const deletedbookmark = await dboperations.DeleteBookmark(id_bookmark);
        if (deletedbookmark.error) {
            return res.status(404).json(deletedbookmark);
        }

        return res.status(200).json(deletedbookmark);
    } catch (error) {
        res.status(500).json({ error: `${error.message}` })
    }
})
// end of bookmark

app.delete("/produk/:id", (req, res) => {
    const id = req.params.id;

    dboperations.deleteproduk(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);
    });
});

app.get("/umkm/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getuserUMKMbyID(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);
    });
});

app.get("/umkm", (req, res) => {
    dboperations.getuserUMKM((error, result) => {
        if (error) {
            console.error("error get semua user UMKM:", error);
            return res.status(500).send("error fetch user UMKM (test purposes)");
        }
        res.json(result);
    });
});

app.post("/api/registrasi-umkm", async (req, res) => {
    const data = req.body;
    
    try {
        const result = await dboperations.registUMKM(data);
        res.status(201).json({ message: 'UMKM registered successfully', data: result });
    } catch (error) {
        console.error('Error in /api/umkm:', error);
        if (error.message.includes('Missing required field')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Username, email, or NIK_KTP already exists' });
        }
        if (error.message.includes('NIK_KTP must be a valid integer')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to register UMKM: ' + error.message });
    }
});

app.post("/api/masuk-umkm", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Received login request:', { email });

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan kata sandi wajib diisi' });
        }

        const result = await dboperations.loginUMKM({ email, password });
        console.log('loginUMKM result:', result);

        // cek status is_verified 
        const user = await dboperations.getUMKMById(result.id_umkm);
        console.log('User data:', user.toJSON ? user.toJSON() : user);
        const is_verified = user.is_verified ? 1 : 0;


        if (!is_verified) {
            // kirim OTP lewat email jika is_verified == 0 (false)
            const msg = {
                to: result.email,
                from: process.env.EMAIL_FROM,
                subject: 'Kode OTP Untuk Masuk ke Akun UMKMKU',
                text: `Kode OTP anda adalah ${result.auth_code}.`,
                html: `<p>Kode OTP anda adalah <strong>${result.auth_code}</strong></p>`
            };
            console.log('Email from:', process.env.EMAIL_FROM);
            console.log('SendGrid payload:', msg);

            console.log('Sending OTP email to:', result.email);
            await sgMail.send(msg);
            console.log('OTP email sent successfully');

            return res.status(200).json({
                message: 'OTP terkirim ke email anda',
                id_umkm: result.id_umkm,
                is_verified: 0
            });
        }

        // skip kirim otp jika is_verified == 1 (true)
        res.status(200).json({
            message: 'Login berhasil',
            id_umkm: result.id_umkm,
            is_verified: 1
        });
    } catch (error) {
        console.error('Error di /api/masuk-umkm:', error.message);
        if (error.message === 'Pengguna tidak tersedia') {
            return res.status(401).json({ error: 'Email tidak terdaftar' });
        }
        if (error.message === 'Password salah') {
            return res.status(401).json({ error: 'Kata sandi salah' });
        }
        return res.status(500).json({ error: 'Gagal masuk: ' + error.message });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received forgot password request:', { email });

        const { token } = await dboperations.forgotPassword(email);

        const resetUrl = `https://tubeswebpro-production.up.railway.app//reset-password?email=${encodeURIComponent(email)}&token=${token}`;
        
        // isi email
        const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Reset Kata Sandi Akun UMKMKU',
        text: `Klik link berikut untuk mereset kata sandi Anda: ${resetUrl}\nLink ini berlaku selama 1 jam.`,
        html: `<p>Klik link berikut untuk mereset kata sandi Anda:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link ini berlaku selama 1 jam.</p>`
        };

        console.log('Sending reset email to:', email);
        await sgMail.send(msg);
        console.log('Reset email sent successfully');
        console.log('URL Reset Password:', resetUrl);

        res.status(200).json({ message: 'Link reset kata sandi telah dikirim ke email Anda' });
    } catch (error) {
        console.error('Error di /api/forgot-password:', error.message);
        if (error.message === 'Email wajib diisi') {
        return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Email tidak terdaftar') {
        return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengirim link reset: ' + error.message });
    }
});

app.post("/api/reset-password", async (req, res) => {
    try {
        const { email, token, password } = req.body;
        console.log('Received reset password request:', { email });

        await dboperations.resetPassword({ email, token, password });

        res.status(200).json({ message: 'Kata sandi berhasil direset' });
    } catch (error) {
        console.error('Error di /api/reset-password:', error.message);
        if (error.message === 'Email, token, dan kata sandi wajib diisi') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Token tidak valid atau telah kedaluwarsa') {
            return res.status(401).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mereset kata sandi: ' + error.message });
    }
});

app.post("/api/verifikasi-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: 'Email dan OTP wajib diisi' });
        }

        const isValid = await dboperations.verifikasiOTP({ email, otp });
        if (!isValid) {
            return res.status(401).json({ error: 'OTP tidak valid' });
        }

        // hapus otp setelah verifikas
        // await user.update({ is_verified: true, auth_code: null });

        res.status(200).json({ message: 'Verifikasi OTP berhasil' });
    } catch (error) {
        console.error('Error di /api/verifikasi-otp:', error.message);
        return res.status(500).json({ error: 'Gagal memverifikasi OTP: ' + error.message });
    }
});

app.post("/api/kirim-ulang-otp", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email wajib diisi' });
        }

        const result = await dboperations.kirimUlangOTP(email);

        // kirim email OTP baru
        const msg = {
            to: result.email,
            from: process.env.EMAIL_FROM,
            subject: 'Kode OTP Untuk Masuk ke Akun UMKMKU',
            text: `Kode OTP anda adalah ${result.auth_code}.`,
            html: `<p>Kode OTP anda adalah <strong>${result.auth_code}</strong></p>`
        };

        console.log('Kirim ulang code OTP email ke:', result.email);
        await sgMail.send(msg);
        console.log('OTP email berhasil dikirim');

        res.status(200).json({
            message: 'OTP terkirim ke email anda',
            id_umkm: result.id_umkm
        });
    } catch (error) {
        console.error('Error di /api/resend-otp:', error.message);
        return res.status(500).json({ error: 'Gagal mengirim ulang OTP: ' + error.message });
    }
});

// start ulasan section
// fetch semua ulasan
app.get('/ulasans', async (req, res) => {
    try {
        const result = await dboperations.getUlasans();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching ulasans:', error);
        res.status(500).json({ message: 'Error fetching ulasans', error: error.message });
    }
});

// fetch ulasan dari id produk tertentu
app.get('/ulasans/produk/:id_produk', async (req, res) => {
    const id_produk = req.params.id_produk;
    try {
        const result = await dboperations.getUlasansByProdukId(id_produk);
        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Belum ada ulasan untuk produk ini!' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching ulasans by product ID:', error);
        res.status(500).json({ message: 'Error fetching ulasans', error: error.message });
    }
});

// fetch seluruh ulasan dari umkm tertentu
app.get('/ulasans/umkm/:id_umkm', async (req, res) => {
    const id_umkm = req.params.id_umkm;
    try {
        const result = await dboperations.getUlasansByIdUMKM(id_umkm);
        if (!result || result.length === 0) {
            return res.status(404).json({ message: 'Belum ada ulasan untuk UMKM ini!' });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching ulasans by UMKM ID:', error);
        res.status(500).json({ message: 'Error fetching ulasans', error: error.message });
    }
});

// post ulasan baru
app.post('/ulasans', async (req, res) => {
    try {
        const { id_pembeli, id_produk, username, ulasan, rating } = req.body;

        // validasi
        if (!id_pembeli || !id_produk || !username || !ulasan || !rating) {
            return res.status(400).json({ message: 'Lengkapi formulir!' });
        }
        if (rating < 0 || rating > 5) {
            return res.status(400).json({ message: 'Rating harus antara 0 sampai 5!' });
        }

        const newUlasan = await dboperations.createUlasan({
            id_pembeli,
            id_produk,
            username,
            ulasan,
            rating,
        });

        res.status(201).json(newUlasan);
    } catch (error) {
        console.error('Error menambahkan ulasan:', error);
        res.status(500).json({ message: 'Error menambahkan ulasan', error: error.message });
    }
});

// edit ulasan
app.put('/ulasans/:id_ulasan', async (req, res) => {
    const id_ulasan = req.params.id_ulasan;
    const { ulasan, rating } = req.body;

    try {
        // validasi
        if (!ulasan && !rating) {
            return res.status(400).json({ message: 'Isi ulasan atau rating!' });
        }
        if (rating && (rating < 0 || rating > 5)) {
            return res.status(400).json({ message: 'Rating harus antara 0 sampai 5!' });
        }

        const updatedUlasan = await dboperations.updateUlasan(id_ulasan, { ulasan, rating });
        if (!updatedUlasan) {
            return res.status(404).json({ message: 'Ulasan tidak tersedia' });
        }

        res.status(200).json(updatedUlasan);
    } catch (error) {
        console.error('Error updating ulasan:', error);
        res.status(500).json({ message: 'Error updating ulasan', error: error.message });
    }
});

// hapus ulasan
app.delete('/ulasans/:id_ulasan', async (req, res) => {
    const id_ulasan = req.params.id_ulasan;
    try {
        const deleted = await dboperations.deleteUlasan(id_ulasan);
        if (!deleted) {
            return res.status(404).json({ message: 'Ulasan tidak tersedia' });
        }
        res.status(200).json({ message: 'Ulasan berhasil dihapus' });
    } catch (error) {
        console.error('Error menghapus ulasan:', error);
        res.status(500).json({ message: 'Error menghapus ulasan', error: error.message });
    }
});
// end ulasan section

app.get("/overallrating/:id_umkm", (req, res) => {
    const id_umkm = req.params.id_umkm;

    dboperations.getOverallRating(id_umkm, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);
    });
});

// Route to get all messages
app.get("/message", (req, res) => {
    dboperations.getMessages((error, result) => {
        if (error) {
            console.error("Error fetching messages:", error);
            return res.status(500).send("Error fetching messages");
        }
        res.status(200).json(result);
    });
});

// Route to get messages by sender and receiver
app.get("/message/msgUMKM/:id_umkm", (req, res) => {
    const id_umkm = req.params.id_umkm;

    dboperations.getMessagesByUMKM(id_umkm, (error, result) => {
        if (error) {
            console.error("Error fetching messages by sender and receiver:", error);
            return res.status(500).send("Error fetching messages");
        }
        res.status(200).json(result);
    });
});

app.get("/getmsgUMKMPembeli/:id_umkm/:id_pembeli", async (req, res) => {
    const id_umkm = req.params.id_umkm;
    const id_pembeli = req.params.id_pembeli;

    dboperations.getmessagesbyUMKMandPembeli(
        id_umkm,
        id_pembeli,
        (error, result) => {
            if (error) {
                console.error("Error fetching messages:", error);
                return res.status(500).json({ error: "Error fetching messages" });
            }

            if (!Array.isArray(result) || result.length === 0) {
                return res.json([]);
            }

            res.json(result);

            const lastMessage = result[result.length - 1];

            console.log(
                `Emitting newMessage event for UMKM ID: ${id_umkm}, Pembeli ID: ${id_pembeli}`
            );

            io.emit("newMessage", {
                id_umkm: id_umkm,
                id_pembeli: id_pembeli,
                message: lastMessage.message,
                sent_at: lastMessage.sent_at,
                sender: lastMessage.username || lastMessage.nama_lengkap,
            });
        }
    );
});

app.get("/getLatestMsgUMKMPembeli/:id_umkm/:id_pembeli", async (req, res) => {
    const id_umkm = req.params.id_umkm;
    const id_pembeli = req.params.id_pembeli;

    dboperations.getLatestMessageByUMKMandPembeli(
        id_umkm,
        id_pembeli,
        (error, result) => {
            if (error) {
                console.error("Error fetching latest message:", error);
                return res.status(500).json({ error: "Error fetching latest message" });
            }

            if (!result) {
                return res.json({ message: "No messages found" });
            }

            res.json(result);
        }
    );
});

app.get("/message/msgPembeli/:id_pembeli", (req, res) => {
    const id_pembeli = req.params.id_pembeli;

    dboperations.getMessagesByPembeli(id_pembeli, (error, result) => {
        if (error) {
            console.error("Error fetching messages by sender and receiver:", error);
            return res.status(500).send("Error fetching messages");
        }
        res.status(200).json(result);
    });
});

app.get("/getmsgPembeliUMKM/:id_pembeli/:id_umkm", async (req, res) => {
    const { id_pembeli, id_umkm } = req.params;

    dboperations.getMessagesByPembeliAndUMKM(
        id_pembeli,
        id_umkm,
        (error, result) => {
            if (error) {
                console.error("Error fetching messages:", error);
                return res.status(500).json({ error: "Error fetching messages" });
            }

            res.json(result);

            if (result.length > 0) {
                const lastMessage = result[result.length - 1];

                io.emit("newMessage", {
                    id_pembeli,
                    id_umkm,
                    message: lastMessage.message,
                    sent_at: lastMessage.sent_at,
                    sender: lastMessage.username || lastMessage.nama_lengkap,
                });
            }
        }
    );
});

app.get("/getLatestMsgPembeliUMKM/:id_pembeli/:id_umkm", async (req, res) => {
    const { id_pembeli, id_umkm } = req.params;

    dboperations.getLatestMessageByPembeliAndUMKM(
        id_pembeli,
        id_umkm,
        (error, result) => {
            if (error) {
                console.error("Error fetching latest message:", error);
                return res.status(500).json({ error: "Error fetching latest message" });
            }

            if (!result) {
                return res.json({ message: "No messages found" });
            }

            res.json(result);
        }
    );
});

app.get("/getmsgPembeliKurir/:id_pembeli/:id_kurir", async (req, res) => {
    const { id_pembeli, id_kurir } = req.params;

    dboperations.getMessagesByPembeliAndKurir(
        id_pembeli,
        id_kurir,
        (error, result) => {
            if (error) {
                console.error("Error fetching messages:", error);
                return res.status(500).json({ error: "Error fetching messages" });
            }

            res.json(result);

            if (result.length > 0) {
                const lastMessage = result[result.length - 1];

                io.emit("newMessage", {
                    id_pembeli,
                    id_kurir,
                    message: lastMessage.message,
                    sent_at: lastMessage.sent_at,
                    sender: lastMessage.nama_kurir || lastMessage.nama_lengkap,
                });
            }
        }
    );
});

app.get("/getLatestMsgPembeliKurir/:id_pembeli/:id_kurir", async (req, res) => {
    const { id_pembeli, id_kurir } = req.params;

    dboperations.getLatestMessageByPembeliAndKurir(
        id_pembeli,
        id_kurir,
        (error, result) => {
            if (error) {
                console.error("Error fetching latest message:", error);
                return res.status(500).json({ error: "Error fetching latest message" });
            }

            if (!result) {
                return res.json({ message: "No messages found" });
            }

            res.json(result);
        }
    );
});


app.get("/message/msgKurir/:id_kurir", (req, res) => {
    const id_kurir = req.params.id_kurir;

    dboperations.getMessagesByKurir(id_kurir, (error, result) => {
        if (error) {
            console.error("Error fetching messages by sender and receiver:", error);
            return res.status(500).send("Error fetching messages");
        }
        res.status(200).json(result);
    });
});

app.get("/getmsgKurirPembeli/:id_kurir/:id_pembeli", async (req, res) => {
    const { id_kurir, id_pembeli } = req.params;

    dboperations.getMessagesByKurirAndPembeli(
        id_kurir,
        id_pembeli,
        (error, result) => {
            if (error) {
                console.error("Error fetching messages:", error);
                return res.status(500).json({ error: "Error fetching messages" });
            }

            res.json(result);

            if (result.length > 0) {
                const lastMessage = result[result.length - 1];

                io.emit("newMessage", {
                    id_kurir,
                    id_pembeli,
                    message: lastMessage.message,
                    sent_at: lastMessage.sent_at,
                    sender: lastMessage.nama_kurir || lastMessage.nama_lengkap,
                });
            }
        }
    );
});

app.get("/getLatestMsgKurirPembeli/:id_kurir/:id_pembeli", async (req, res) => {
    const { id_kurir, id_pembeli } = req.params;

    dboperations.getLatestMessageByKurirAndPembeli(
        id_kurir,
        id_pembeli,
        (error, result) => {
            if (error) {
                console.error("Error fetching latest message:", error);
                return res.status(500).json({ error: "Error fetching latest message" });
            }

            if (!result) {
                return res.json({ message: "No messages found" });
            }

            res.json(result);
        }
    );
});


app.post("/sendchat/umkmkepembeli/:id_umkm/:id_pembeli", (req, res) => {
    const data = req.body;
    const id_umkm = req.params.id_umkm;
    const id_pembeli = req.params.id_pembeli;

    dboperations.sendMessageUMKMKePembeli(id_umkm, id_pembeli, data, (error, result) => {
        if (error) {
            console.error("Error insert message:", error);
            return res.status(500).send("Error inserting message.");
        }
        res.status(200).json(result);
    });
});



app.post("/sendchat/pembelikeumkm/:id_pembeli/:id_umkm", (req, res) => {
    const data = req.body;
    const id_pembeli = req.params.id_pembeli;
    const id_umkm = req.params.id_umkm;

    dboperations.sendMessagePembeliKeUMKM(id_pembeli, id_umkm, data, (error, result) => {
        if (error) {
            console.error("Error insert message:", error);
            return res.status(500).send("Error inserting message.");
        }

        console.log("📢 Emitting newMessage event:", {
            id_umkm,
            id_pembeli,
            message: data.message,
            receiver_type: "UMKM",
        });

        io.to(`umkm_${id_umkm}`).emit("newMessage", {
            id_umkm,
            id_pembeli,
            message: data.message,
            receiver_type: "UMKM",
            timestamp: new Date().toISOString(),
        });
        res.status(200).json(result);
    });
});

app.post("/sendchat/pembelikekurir/:id_pembeli/:id_kurir", (req, res) => {
    const data = req.body;
    const id_pembeli = req.params.id_pembeli;
    const id_kurir = req.params.id_kurir;

    dboperations.sendMessagePembeliKeKurir(id_pembeli, id_kurir, data, (error, result) => {
        if (error) {
            console.error("Error insert message:", error);
            return res.status(500).send("Error inserting message.");
        }
        res.status(200).json(result);
    });
});


app.post("/sendchat/kurirkepembeli/:id_kurir/:id_pembeli", (req, res) => {
    const data = req.body;
    const id_kurir = req.params.id_kurir;
    const id_pembeli = req.params.id_pembeli;

    dboperations.sendMessageKurirKePembeli(id_kurir, id_pembeli, data, (error, result) => {
        if (error) {
            console.error("Error insert message:", error);
            return res.status(500).send("Error inserting message.");
        }
        res.status(200).json(result);
    });
});

// Route to mark a message as read
app.put("/message/read/:id_pembeli", (req, res) => {
    const { id_pembeli } = req.params;

    if (!id_pembeli) {
        return res.status(400).send("Pembeli ID is required");
    }

    dboperations.markMessageAsRead(id_pembeli, (error, result) => {
        if (error) {
            console.error("Error marking message as read:", error);
            return res.status(500).send("Error marking message as read");
        }
        res.status(200).json(result);
    });
});


// Route to delete a message
app.delete("/message/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send("Message ID is required");
    }

    dboperations.deleteMessage(id, (error, result) => {
        if (error) {
            console.error("Error deleting message:", error);
            return res.status(500).send("Error deleting message");
        }
        res.status(200).json(result);
    });
});

// Get all pembeli
app.get("/pembeli", (req, res) => {
    dboperations.getPembeli((error, result) => {
        if (error) {
            console.error("Error fetching pembeli:", error);
            return res.status(500).send("Error fetching pembeli");
        }
        res.json(result); // Send all pembeli data
    });
});

// Get pembeli by ID
app.get("/pembeli/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getPembeliByID(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(result); // Send pembeli data by ID
    });
});

// Add a new pembeli
app.post("/pembeli", (req, res) => {
    const data = req.body;
    dboperations.addPembeli(data, (error, result) => {
        if (error) {
            return res.status(500).send("Error adding pembeli");
        }
        res.status(200).json(result); // Send the newly created pembeli
    });
});

// Update pembeli by ID
app.put("/pembeli/:id", (req, res) => {
    const id = req.params.id;
    const data = req.body;
    dboperations.updatePembeli(id, data, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result); // Send updated pembeli data
    });
});

// Delete pembeli by ID
app.delete("/pembeli/:id", (req, res) => {
    const id = req.params.id;
    dboperations.deletePembeli(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result); // Send success message
    });
});

app.post("/checkPembeli", (req, res) => {
    const { email, username } = req.body;
    dboperations.checkPembeli(email, username, (error, result) => {
        if (error) {
            return res.status(500).json({ error: "Error checking user" });
        }
        return res.status(200).json(result);
    });
});

app.post("/checkPembeliByEmail", (req, res) => {
    const { email } = req.body;
    dboperations.checkPembeliByEmail(email, (error, result) => {
        if (error) {
            return res.status(500).json({ error: "Error checking user" });
        }
        return res.status(200).json(result);
    });
});

app.post("/loginpembeli", (req, res) => {
    const { email, password } = req.body;
    dboperations.loginPembeli({ email, password }, (error, result) => {
        if (error) {
            return res.status(401).send(error.message);
        }
        res.status(200).json(result);
    });
});

app.put("/changepassword", (req, res) => {
    const { email, newPassword } = req.body;

    dboperations.changePasswordPembeli(email, newPassword, (error, result) => {
        if (error) {
            return res.status(500).json({ message: "Error changing password", error: error.message });
        }
        res.status(200).json({ message: "Password changed successfully", data: result });
    });
});


// Get all kurir
app.get("/kurir", (req, res) => {
    dboperations.getKurir((error, result) => {
        if (error) {
            console.error("Error fetching kurir:", error);
            return res.status(500).send("Error fetching kurir");
        }
        res.json(result); // Send all kurir data
    });
});

// Get kurir by ID
app.get("/kurir/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getKurirByID(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(result); // Send kurir data by ID
    });
});

// Add a new kurir
app.post("/kurir", async (req, res) => {
    try {
        const { nama_kurir, id_umkm, email, password } = req.body;
        const newKurir = await Kurir.create({
            nama_kurir,
            id_umkm,
            // id_pesanan,
            email,
            password,
        });

        res.status(201).json(newKurir);
    } catch (error) {
        console.error("Error adding kurir:", error);
        res.status(500).send("Error adding kurir");
    }
});

// Update kurir by ID
app.put("/kurir/:id", (req, res) => {
    const id = req.params.id;
    const data = req.body;
    dboperations.updateKurir(id, data, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result); // Send updated kurir data
    });
});

// Delete kurir by ID
app.delete("/kurir/:id", (req, res) => {
    const id = req.params.id;
    dboperations.deleteKurir(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result); // Send success message
    });
});


app.post("/loginkurir", (req, res) => {
    const { email, password } = req.body;
    dboperations.loginKurir({ email, password }, (error, result) => {
        if (error) {
            return res.status(401).send(error.message);
        }
        res.status(200).json(result);
    });
});

app.post("/checkkurir", (req, res) => {
    const { email } = req.body;
    dboperations.checkKurir(email, (error, result) => {
        if (error) {
            return res.status(500).send("Error checking Kurir");
        }
        return res.status(200).json({ emailExists: result.exists });
    });
});

app.get('/daily-stats/:umkmId', async (req, res) => {
    const { umkmId } = req.params;
    const { month, year } = req.query;

    // Validate inputs
    if (!month || !year || isNaN(month) || isNaN(year)) {
        return res.status(400).json({
            error: 'Invalid parameters',
            message: 'Month and year must be valid numbers'
        });
    }

    try {
        const dailyStats = await dboperations.getDailyStatsByUMKM(
            parseInt(umkmId),
            parseInt(month),
            parseInt(year)
        );

        res.json(dailyStats);
    } catch (error) {
        console.error('Error fetching daily stats:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
});

app.get('/monthly-stats/:umkmId', async (req, res) => {
    const { umkmId } = req.params;
    const { year } = req.query;

    // Validate input
    const selectedYear = parseInt(year) || new Date().getFullYear();
    if (isNaN(selectedYear)) {
        return res.status(400).json({
            error: 'Invalid parameter',
            message: 'Year must be a valid number'
        });
    }

    try {
        const monthlyStats = await dboperations.getMonthlyStatsByUMKM(
            parseInt(umkmId),
            selectedYear
        );

        // Ensure all months are represented (fill empty months)
        const completeStats = Array.from({ length: 12 }, (_, i) => {
            const monthData = monthlyStats.find(m => m.month === i + 1);
            return monthData || {
                month: i + 1,
                year: selectedYear,
                total_sales: 0,
                total_orders: 0,
                products: []
            };
        });

        res.json(completeStats);
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
});

app.get("/riwayat", async (req, res) => {
    try {
        const riwayat = await dboperations.getRiwayat();
        res.json(riwayat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Server Dapa

app.get("/gethistorykurirumkm/:id_umkm", (req, res) => {
    const id = req.params.id_umkm;

    dboperations.gethistorykurirumkm(id, (error, result) => {
        if (error) {
            console.error("error get data kurir:", error);
            return res.status(500).send("error fetch data kurir");
        }
        res.json(result);
    });
});

app.get("/getallumkm", (req, res) => {

    dboperations.getalluserUMKM((error, result) => {
        if (error) {
            console.error("error get data umkm:", error);
            return res.status(500).send("error fetch data umkm");
        }
        res.json(result);
    });
});

app.get("/getdaftarkurir/:id_umkm", (req, res) => {
    const id = req.params.id_umkm;

    dboperations.getdaftarkurir(id, (error, result) => {
        if (error) {
            console.error("error get data kurir:", error);
            return res.status(500).send("error fetch data kurir");
        }
        res.json(result);
    });
});

app.get("/getumkmkurir/:id_umkm", (req, res) => {
    const id = req.params.id_umkm;

    dboperations.getumkmkurir(id, (error, result) => {
        if (error) {
            console.error("error get data kurir:", error);
            return res.status(500).send("error fetch data kurir");
        }
        res.json(result);
    });
});

app.get("/getpesananmasuk/:id", (req, res) => {
    const id = req.params.id;

    dboperations.getpesananmasuk(id, (error, result) => {
        if (error) {
            console.error("error get pesanan:", error);
            return res.status(500).send("error fetch pesanan");
        }
        res.json(result);
    });
});

app.get("/getpesananditerima/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getpesananditerima(id, (error, result) => {
        if (error) {
            console.error("error get pesanan:", error);
            return res.status(500).send("error fetch pesanan");
        }
        res.json(result);
    });
});

app.get("/getpesananditolak/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getpesananditolak(id, (error, result) => {
        if (error) {
            console.error("error get pesanan:", error);
            return res.status(500).send("error fetch pesanan");
        }
        res.json(result);
    });
});

app.get("/getpesananselesai/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getpesananselesai(id, (error, result) => {
        if (error) {
            console.error("error get pesanan:", error);
            return res.status(500).send("error fetch pesanan");
        }
        res.json(result);
    });
});

app.get("/getriwayatpesanan/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getriwayatpesanan(id, (error, result) => {
        if (error) {
            console.error("error get riwayat:", error);
            return res.status(500).send("error fetch riwayat");
        }
        res.json(result);
    });
});

app.get("/getallpesananaktifpembeli/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getallpesananaktifpembeli(id, (error, result) => {
        if (error) {
            console.error("error get riwayat:", error);
            return res.status(500).send("error fetch riwayat");
        }
        res.json(result);
    });
});

app.get("/getprofileumkm/:id", (req, res) => {
    const id = req.params.id;

    dboperations.getprofileumkm(id, (error, result) => {
        if (error) {
            console.error("error get riwayat:", error);
            return res.status(500).send("error fetch riwayat");
        }
        res.json(result);
    });
});

app.get("/getdatadashboardproduklaris/:id", (req, res) => {
    const id = req.params.id;

    dboperations.getdatadashboardproduklaris(id, (error, result) => {
        if (error) {
            console.error("error get riwayat:", error);
            return res.status(500).send("error fetch riwayat");
        }
        res.json(result);
    });
});

app.get("/getdatadashboardpesananmasuk/:id", (req, res) => {
    const id = req.params.id;

    dboperations.getdatadashboardpesananmasuk(id, (error, result) => {
        if (error) {
            console.error("error get riwayat:", error);
            return res.status(500).send("error fetch riwayat");
        }
        res.json(result);
    });
});

app.get("/getdatadashboardprodukpalingbaru/:id", (req, res) => {
    const id = req.params.id;

    dboperations.getdatadashboardprodukpalingbaru(id, (error, result) => {
        if (error) {
            console.error("error get riwayat:", error);
            return res.status(500).send("error fetch riwayat");
        }
        res.json(result);
    });
});

app.get("/getdatadashboardpesanpalingbaru/:id", (req, res) => {
    const id = req.params.id;

    dboperations.getdatadashboardpesanpalingbaru(id, (error, result) => {
        if (error) {
            console.error("error get riwayat:", error);
            return res.status(500).send("error fetch riwayat");
        }
        res.json(result);
    });
});

app.get("/getdatadashboardcampaignpalingbaru/:id", (req, res) => {
    const id = req.params.id;

    dboperations.getdatadashboardcampaignpalingbaru(id, (error, result) => {
        if (error) {
            console.error("error get riwayat:", error);
            return res.status(500).send("error fetch riwayat");
        }
        res.json(result);
    });
});

app.get("/getkeranjangbyidbatch/:id_pembeli/:id_batch", (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    const id_batch = req.params.id_batch;


    dboperations.getkeranjangbyidbatch(id_pembeli, id_batch, (error, result) => {
        if (error) {
            console.error("error get riwayat:", error);
            return res.status(500).send("error fetch riwayat");
        }
        res.json(result);
    });
});

app.post("/addriwayat", (req, res) => {
    const data = req.body;
    dboperations.addriwayat(data, (error, result) => {
        if (error) {
            console.error("error insert riwayat:", error);
            return res.status(500).send("error nambah riwayat");
        }
        res.status(200).json(result);
    });
});

app.post("/addpesanan/:id_keranjang/:total_belanja/:id_pembeli", (req, res) => {
    const id_keranjang = req.params.id_keranjang;
    const total_belanja = req.params.total_belanja;
    const id_pembeli = req.params.id_pembeli;


    dboperations.addpesanan(id_keranjang, total_belanja, id_pembeli, (error, result) => {
        if (error) {
            console.error("error insert pesanan:", error);
            return res.status(500).send("error nambah pesanan");
        }
        res.status(200).json(result);
    });
});

app.put("/updateStatusKurirDipecat/:id_kurir", (req, res) => {
    const id_kurir = req.params.id_kurir;

    dboperations.updateStatusKurirDipecat(id_kurir, (error, result) => {
        if (error) {
            console.error("error update status kurir diterima:", error);
            return res.status(500).send("error status kurir diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updateStatusKurirTerdaftar/:id_kurir", (req, res) => {
    const id_kurir = req.params.id_kurir;

    dboperations.updateStatusKurirTerdaftar(id_kurir, (error, result) => {
        if (error) {
            console.error("error update status kurir diterima:", error);
            return res.status(500).send("error status kurir diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updateStatusKurirDitolak/:id_kurir", (req, res) => {
    const id_kurir = req.params.id_kurir;

    dboperations.updateStatusKurirDitolak(id_kurir, (error, result) => {
        if (error) {
            console.error("error update status kurir ditolak:", error);
            return res.status(500).send("error status kurir ditolak");
        }
        res.status(200).json(result);
    });
});

app.put("/updateStatusKurirBelumTerdaftar/:id_kurir", (req, res) => {
    const id_kurir = req.params.id_kurir;

    dboperations.updateStatusKurirBelumTerdaftar(id_kurir, (error, result) => {
        if (error) {
            console.error("error update status kurir belum terdaftar:", error);
            return res.status(500).send("error status kurir belum terdaftar");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuspesananmasuk/:id_umkm/:id_batch", (req, res) => {
    const id_umkm = req.params.id_umkm;
    const id_batch = req.params.id_batch;

    dboperations.updatestatuspesananmasuk(id_umkm, id_batch, (error, result) => {
        if (error) {
            console.error("error update status pesanan diterima:", error);
            return res.status(500).send("error status pesanan diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuspesananditerima/:id_umkm/:id_batch", (req, res) => {
    const id_umkm = req.params.id_umkm;
    const id_batch = req.params.id_batch;

    dboperations.updatestatuspesananditerima(id_umkm, id_batch, (error, result) => {
        if (error) {
            console.error("error update status pesanan diterima:", error);
            return res.status(500).send("error status pesanan diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuspesanandiantar/:id_umkm/:id_batch", (req, res) => {
    const id_umkm = req.params.id_umkm;
    const id_batch = req.params.id_batch;

    dboperations.updatestatuspesanandiantar(id_umkm, id_batch, (error, result) => {
        if (error) {
            console.error("error update status pesanan diterima:", error);
            return res.status(500).send("error status pesanan diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuspesananditolak/:id_umkm/:id_batch", (req, res) => {
    const id_umkm = req.params.id_umkm;
    const id_batch = req.params.id_batch;

    dboperations.updatestatuspesananditolak(id_umkm, id_batch, (error, result) => {
        if (error) {
            console.error("error update status pesanan diterima:", error);
            return res.status(500).send("error status pesanan diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuspesananselesai/:id_umkm/:id_batch", (req, res) => {
    const id_umkm = req.params.id_umkm;
    const id_batch = req.params.id_batch;

    dboperations.updatestatuspesananselesai(id_umkm, id_batch, (error, result) => {
        if (error) {
            console.error("error update status pesanan selesai:", error);
            return res.status(500).send("error status pesanan selesai");
        }
        res.status(200).json(result);
    });
});

app.put("/updatepasswordpembeli/:email/:newPassword", (req, res) => {
    const email = req.params.email;
    const newPassword = req.params.newPassword;
    dboperations.updatepasswordpembeli(email, newPassword, (error, result) => {
        if (error) {
            console.error("error update status pesanan diterima:", error);
            return res.status(500).send("error status pesanan diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updatedataumkm/:id", (req, res) => {
    const id = req.params.id;
    const data = req.body;
    dboperations.updatedataumkm(id, data, (error, result) => {
        if (error) {
            console.error("error update data UMKM:", error);
            return res.status(500).send("error update data UMKM");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuskeranjang/:id", (req, res) => {
    const id = req.params.id;
    try {
        const statuskeranjang = dboperations.updatestatuskeranjang(id);
        res.status(200).json({ message: "berhasil mengupdate keranjang" });
    } catch (error) {
        res.status(500).json({ message: "error update status" })
    }
});

app.put("/updateStatusDanIdUmkmKurir/:nama_usaha/:id_kurir", (req, res) => {
    const nama_usaha = req.params.nama_usaha;
    const id_kurir = req.params.id_kurir;
    try {
        const statuskeranjang = dboperations.updateStatusDanIdUmkmKurir(nama_usaha, id_kurir);
        res.status(200).json({ message: "berhasil mengupdate id_umkm dan status pada kurir" });
    } catch (error) {
        res.status(500).json({ message: "error update id_umkm dan status pada kurir" })
    }
});


// End Server Dapa

//start server inbox
app.get("/getinboxpesanan", (req, res) => {
    const id_umkm = req.query.id_umkm;

    if (!id_umkm) {
        return res.status(400).send("Missing required parameter: id_umkm");
    }

    dboperations.getinboxpesanan(id_umkm, (error, result) => {
        if (error) {
            console.error("Error get inbox:", error);
            return res.status(500).send("Error fetching inbox pesanan diterima");
        }
        res.json(result);
    });
});

app.get("/getinboxpesananmasuk", async (req, res) => {
    try {
        const id_umkm = req.query.id_umkm;

        // Validasi input
        if (!id_umkm) {
            return res.status(400).json({ error: "Missing required parameter: id_umkm" });
        }

        // Panggil fungsi untuk mendapatkan data
        dboperations.getinboxpesananmasuk(id_umkm, (error, result) => {
            if (error) {
                console.error("Error fetching inbox pesanan masuk:", error);
                return res.status(500).json({ error: "Failed to fetch inbox pesanan masuk" });
            }

            // Jika tidak ada hasil, kirimkan pesan kosong
            if (!result || result.length === 0) {
                return res.status(404).json({ message: "No Pesanan Masuk found for the given UMKM ID" });
            }

            // Kirimkan hasil
            res.status(200).json(result);
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ error: "An unexpected error occurred" });
    }
});

app.post("/campaign", (req, res) => {
    const campaignData = req.body; // Get campaign data from request body
    dboperations.createCampaign(campaignData, (error, campaign) => {
        if (error) {
            return res
                .status(500)
                .json({ message: "Error creating campaign", error });
        }
        return res.status(201).json(campaign);
    });
});

app.get("/getcampaign/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const campaigns = await dboperations.getCampaign(id); // Correctly assign the value
        if (campaigns.length === 0) {
            return res
                .status(404)
                .json({ message: "No campaigns found for this ID" });
        }
        res.status(200).json(campaigns); // Use `campaigns` here
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching campaigns", error: error.message });
    }
});

app.put("/campaignEdit/:id/:data", (req, res) => {
    const id = req.params.id;
    const data = req.body.data;
    dboperations.updateCampaign(id, data, (error, campaign) => {
        if (error) {
            return res
                .status(500)
                .json({ message: "Error updating campaign", error });
        }
        return res.status(200).json(campaign);
    });
});

app.delete("/campaign/:id", (req, res) => {
    const { id } = req.params; // Get campaign ID from route params
    dboperations.deleteCampaign(id, (error, message) => {
        if (error) {
            return res
                .status(500)
                .json({ message: "Error deleting campaign", error });
        }
        return res.status(200).json({ message });
    });
});

// server socket.io

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// server.js

// app.listen(port, () => {
//     console.log(`server berjalan di ${port}`);
// });
