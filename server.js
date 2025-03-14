// server.js
const express = require("express");
const dboperations = require("./query");
const Kurir = require("./models/kurir");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:8000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", async (data) => {
        try {
            const newMessage = await Message.create({
                message: data.message,
                sent_at: new Date(),
                is_read: false,
                id_umkm: data.id_umkm || null,
                id_pembeli: data.id_pembeli || null,
                id_kurir: data.id_kurir || null,
                receiver_type: data.receiver_type,
            });

            io.emit("newMessage", newMessage); // Kirim pesan ke semua client
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });

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

app.get("/produk/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getprodukbyID(id, (error, result) => {
        if (error) {
            res.status(500).send(error.message);
        }
        res.json(result);
    });
});

app.get("/produk", (req, res) => {
    dboperations.getproduk((error, result) => {
        if (error) {
            console.error("error get produk:", error);
            return res.status(500).send("error fetch produk");
        }
        res.json(result);
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

app.post("/produk", (req, res) => {
    const data = req.body;
    dboperations.addproduk(data, (error, result) => {
        if (error) {
            console.error("error insert produk:", error);
            return res.status(500).send("error nambah produk");
        }
        res.status(200).json(result);
    });
});

app.put("/updateproduk/:id", (req, res) => {
    const id = req.params.id;
    const data = req.body;
    dboperations.updateProduk(id, data, (error, result) => {
        if (error) {
            console.error("error update produk:", error);
            return res.status(500).send("gagal meng-update produk");
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
            console.error("Error getting produk:", error);
            return res.status(500).send("Error fetching produk");
        }
        res.json(result);
    });
});

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

app.post("/umkm", (req, res) => {
    const data = req.body;
    dboperations.registUMKM(data, (error, result) => {
        if (error) {
            console.error("error regist umkm:", error);
            return res.status(500).send("error nambah data umkm");
        }
        res.status(200).json(result);
    });
});

app.post("/login", (req, res) => {
    const { inputEmail, inputPassword } = req.body;

    dboperations.loginUMKM({ inputEmail, inputPassword }, (error, result) => {
        if (error) {
            return res.status(401).send(error.message);
        }
        res.status(200).json(result);
    });
});

app.get("/ulasans", (req, res) => {
    dboperations.getulasans((error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);
    });
});

app.get("/ulasans/:id_produk", (req, res) => {
    const id_produk = req.params.id_produk;

    dboperations.getulasansByProdukId(id_produk, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);
    });
});

app.get("/ulasans/umkm/:id_umkm", (req, res) => {
    const id_umkm = req.params.id_umkm;

    dboperations.getulasansByIdUMKM(id_umkm, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);
    });
});

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

app.get("/getmsgUMKMPembeli/:id_umkm/:id_pembeli", (req, res) => {
    const id_umkm = req.params.id_umkm;
    const id_pembeli = req.params.id_pembeli;


    dboperations.getmessagesbyUMKMandPembeli(id_umkm, id_pembeli, (error, result) => {
        if (error) {
            console.error("error get message:", error);
            return res.status(500).send("error fetch message");
        }
        res.json(result);
    });
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

app.get("/getmsgPembeliUMKM/:id_pembeli/:id_umkm", (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    const id_umkm = req.params.id_umkm;


    dboperations.getMessagesByPembeliAndUMKM(id_pembeli, id_umkm, (error, result) => {
        if (error) {
            console.error("error get message:", error);
            return res.status(500).send("error fetch message");
        }
        res.json(result);
    });
});

app.get("/getmsgPembeliKurir/:id_pembeli/:id_kurir", (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    const id_kurir = req.params.id_kurir;


    dboperations.getMessagesByPembeliAndKurir(id_pembeli, id_kurir, (error, result) => {
        if (error) {
            console.error("error get message:", error);
            return res.status(500).send("error fetch message");
        }
        res.json(result);
    });
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

app.get("/getmsgKurirPembeli/:id_kurir/:id_pembeli", (req, res) => {
    const id_kurir = req.params.id_kurir;
    const id_pembeli = req.params.id_pembeli;


    dboperations.getMessagesByKurirAndPembeli(id_kurir, id_pembeli, (error, result) => {
        if (error) {
            console.error("error get message:", error);
            return res.status(500).send("error fetch message");
        }
        res.json(result);
    });
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


app.get("/monthly-stats/:umkmId", async (req, res) => {
    const { umkmId } = req.params;
    try {
        const stats = await dboperations.getMonthlyStatsByUMKM(umkmId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/daily-stats/:umkmId", async (req, res) => {
    const { umkmId } = req.params;
    const { month, year } = req.query; // Get month and year from query parameters

    try {
        const dailyStats = await dboperations.getDailyStatsByUMKM(
            umkmId,
            month,
            year
        ); // Use the imported function
        res.json(dailyStats);
    } catch (error) {
        console.error("Error fetching daily stats:", error);
        res.status(500).send("Internal Server Error");
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
            console.error("error update status pesanan diterima:", error);
            return res.status(500).send("error status pesanan diterima");
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

app.get("/getbloburl/", async (req, res) => {
    try {
        const containerName = "storeimg";
        const blobName = "ayamgeprek.jpg";

        const result = await dboperations.getBlobUrl(containerName, blobName); // Tunggu hasil fungsi asynchronous
        res.json({ url: result }); // Kirim URL sebagai JSON
    } catch (error) {
        console.error("Error fetching blob URL:", error);
        res.status(500).send("Error fetching blob URL");
    }
});

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "File tidak ditemukan!" });
        }

        const containerName = "storeimg";
        const blobName = `${Date.now()}-${req.file.originalname}`;
        const contentType = req.file.mimetype;

        // Panggil fungsi untuk upload file ke Azure Blob Storage
        const blobUrl = await dboperations.uploadFileToBlob(
            containerName,
            req.file.buffer,
            blobName,
            contentType
        );

        res.status(200).json({
            message: "File berhasil diunggah!",
            blobUrl,
        });
    } catch (error) {
        console.error("Kesalahan saat mengunggah file:", error.message);
        res
            .status(500)
            .json({ message: "Terjadi kesalahan saat mengunggah file." });
    }
});

// End Server Dapa

//start server inbox
app.get("/getinboxpesanan", (req, res) => {
    dboperations.getinboxpesanan((error, result) => {
        if (error) {
            console.error("error get inbox:", error);
            return res.status(500).send("error fetch inbox pesanan");
        }
        res.json(result);
    });
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
