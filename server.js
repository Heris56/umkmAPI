// server.js
const express = require("express");
const dboperations = require("./query");
const Kurir = require("./models/kurir");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
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
            return res.status(500).send('gagal memasukan ke keranjang');
        }
        res.json(result).status(200);
    });
});

app.put("/order/:id_pembeli", (req, res) => {
    const id_pembeli = req.params.id_pembeli
    dboperations.updatestatuskeranjang(id_pembeli, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).send('gagal order pesanan:');
        }
        res.json(result).status(200);
    });
});

app.get("/keranjangstandby/:id_pembeli", (req, res) => {
    const id_pembeli = req.params.id_pembeli;
    dboperations.getkeranjangstandby(id_pembeli, (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).send('gagal get keranjang stand by');
        }
        return res.json(result).status(200);
    });
})

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

app.get("/keranjang/:id", (req, res) => {
    const id = req.params.id;
    dboperations.getkeranjangbyID(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(result).status(200);
        console.log(`berhasil mendapatkan keranjang dengan user id:${id}`);
    });
});

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


    dboperations.getmessagesbyumkmandpembeli(id_umkm, id_pembeli, (error, result) => {
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

//mungkin dihapus
// Route to send a message
// app.post("/message/msgUMKM/:id_umkm/id_pembeli", (req, res) => {
//     const data = req.body;
//     const id_umkm = req.params.id_umkm;
//     const id_pembeli = req.params.id_pembeli;

//     if (!data || Object.keys(data).length === 0) {
//         return res.status(400).send("Message data is required");
//     }

//     // Ensure 'sent_at' is a valid time string (HH:MM:SS)
//     if (data.sent_at) {
//         const time = data.sent_at.trim(); // Ensure no extra spaces
//         const timeParts = time.split(":");

//         // If time is valid (HH:MM:SS format)
//         if (timeParts.length === 3) {
//             // Ensure the format is correct
//             data.sent_at = time; // Store only time portion
//         } else {
//             return res.status(400).send("Invalid time format for sent_at");
//         }
//     }

//     dboperations.sendMessageUMKMKePembeli(id_umkm, id_pembeli, data, (error, result) => {
//         if (error) {
//             console.error("Error sending message:", error);
//             return res.status(500).send("Error sending message");
//         }
//         res.status(201).json(result);
//     });
// });

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

//mungkin dihapus
// app.post("/message/msgPembeli/:id", (req, res) => {
//     const data = req.body;
//     const id = req.params.id;

//     if (!data || Object.keys(data).length === 0) {
//         return res.status(400).send("Message data is required");
//     }

//     // Ensure 'sent_at' is a valid time string (HH:MM:SS)
//     if (data.sent_at) {
//         const time = data.sent_at.trim(); // Ensure no extra spaces
//         const timeParts = time.split(":");

//         // If time is valid (HH:MM:SS format)
//         if (timeParts.length === 3) {
//             // Ensure the format is correct
//             data.sent_at = time; // Store only time portion
//         } else {
//             return res.status(400).send("Invalid time format for sent_at");
//         }
//     }

//     dboperations.sendMessagePembeliKeUMKM(id, data, (error, result) => {
//         if (error) {
//             console.error("Error sending message:", error);
//             return res.status(500).send("Error sending message");
//         }
//         res.status(201).json(result);
//     });
// });

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

//mungkin dihapus
// app.post("/message/msgKurir/:id/:data", (req, res) => {
//     const data = req.body;
//     const id = req.params.id;

//     if (!data || Object.keys(data).length === 0) {
//         return res.status(400).send("Message data is required");
//     }

//     // Ensure 'sent_at' is a valid time string (HH:MM:SS)
//     if (data.sent_at) {
//         const time = data.sent_at.trim(); // Ensure no extra spaces
//         const timeParts = time.split(":");

//         // If time is valid (HH:MM:SS format)
//         if (timeParts.length === 3) {
//             // Ensure the format is correct
//             data.sent_at = time; // Store only time portion
//         } else {
//             return res.status(400).send("Invalid time format for sent_at");
//         }
//     }

//     dboperations.sendMessageKurirKePembeli(id, data, (error, result) => {
//         if (error) {
//             console.error("Error sending message:", error);
//             return res.status(500).send("Error sending message");
//         }
//         res.status(201).json(result);
//     });
// });

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
app.put("/message/read/:id", (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send("Message ID is required");
    }

    dboperations.markMessageAsRead(id, (error, result) => {
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
app.post("/kurir", (req, res) => {
    const data = req.body;
    dboperations.addKurir(data, (error, result) => {
        if (error) {
            console.error("Error adding kurir:", error);
            return res.status(500).send(`Error adding kurir: ${error.message}`);
        }
        res.status(200).json(result); // Send the newly created kurir
    });
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

app.get("/getpesananaktifpembeli/:id", (req, res) => {
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

app.post("/addpesanan", (req, res) => {
    const data = req.body;
    dboperations.addpesanan(data, (error, result) => {
        if (error) {
            console.error("error insert pesanan:", error);
            return res.status(500).send("error nambah pesanan");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuspesananmasuk/:id", (req, res) => {
    const id = req.params.id;
    dboperations.updatestatuspesananmasuk(id, (error, result) => {
        if (error) {
            console.error("error update status pesanan diterima:", error);
            return res.status(500).send("error status pesanan diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuspesananditerima/:id", (req, res) => {
    const id = req.params.id;
    dboperations.updatestatuspesananditerima(id, (error, result) => {
        if (error) {
            console.error("error update status pesanan diterima:", error);
            return res.status(500).send("error status pesanan diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuspesananditolak/:id", (req, res) => {
    const id = req.params.id;
    dboperations.updatestatuspesananditolak(id, (error, result) => {
        if (error) {
            console.error("error update status pesanan diterima:", error);
            return res.status(500).send("error status pesanan diterima");
        }
        res.status(200).json(result);
    });
});

app.put("/updatestatuspesananselesai/:id", (req, res) => {
    const id = req.params.id;
    dboperations.updatestatuspesananselesai(id, (error, result) => {
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

app.get("/getcampaignbyid/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const campaigns = await dboperations.getCampaignById(id); // Correctly assign the value
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


app.put("/updatecampaign/:id_umkm/:id_campaign", (req, res) => {
    const id_umkm = req.params.id_umkm;
    const id_campaign = req.params.id_campaign;
    const data = req.body;
    dboperations.updateCampaign(id_campaign, id_umkm, data, (error, result) => {
        if (error) {
            console.error("error update data Campaign:", error);
            return res.status(500).send("error update data ");
        }
        res.status(200).json(result);
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

// server.js

app.listen(port, () => {
    console.log(`server berjalan di ${port}`);
});
