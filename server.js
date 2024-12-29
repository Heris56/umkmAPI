// server.js
const express = require('express');
const dboperations = require('./query');
const Kurir = require('./models/kurir');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 80;

app.get('/', (req, res) => {
    res.json({ message: "hello world" })
})

app.get('/barang', (req, res) => {
    dboperations.getbarang((error, result) => {
        if (error) {
            console.error('error get barang:', error);
            return res.status(500).send('error fetch barang');
        }
        res.json(result);
    });
});



app.post('/barang', (req, res) => {
    const data = req.body;
    dboperations.addbarang(data, (error, result) => {
        if (error) {
            console.error('error insert barang:', error);
            return res.status(500).send('error nambah barang');
        }
        res.status(200).json(result);
    });
});





app.get('/produk/:id', (req, res) => {
    const id = req.params.id;
    dboperations.getprodukbyID(id, (error, result) => {
        if (error) {
            res.status(500).send(error.message);
        }
        res.json(result);
    });
});

app.get('/produk', (req, res) => {
    dboperations.getproduk((error, result) => {
        if (error) {
            console.error('error get produk:', error);
            return res.status(500).send('error fetch produk');
        }
        res.json(result);
    });
});

app.post('/produk', (req, res) => {
    const data = req.body;
    dboperations.addproduk(data, (error, result) => {
        if (error) {
            console.error('error insert produk:', error);
            return res.status(500).send('error nambah produk');
        }
        res.status(200).json(result);
    });
});

app.put('/updateproduk/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;
    dboperations.updateProduk(id, data, (error, result) => {
        if (error) {
            console.error('error update produk:', error);
            return res.status(500).send('gagal meng-update produk');
        }
        res.status(200).json(result);
    });
});


app.get('/produkbytipe/tipe', async (req, res) => {
    // Extract 'tipe_barang' from query parameters
    const { tipe_barang } = req.query;

    console.log('tipe_barang:', tipe_barang);

    // Validate that tipe_barang is provided
    if (!tipe_barang) {
        return res.status(400).send('Parameter "tipe_barang" is required.');
    }

    // Call the updated function with the parameter
    dboperations.getProdukByType(tipe_barang, (error, result) => {
        if (error) {
            console.error('Error getting produk:', error);
            return res.status(500).send('Error fetching produk');
        }
        res.json(result);
    });
});

app.get('/keranjang', (req, res) => {
    dboperations.getallKeranjang((error, result) => {
        if (error) {
            return res.status(500).send('error memasukan ke keranjang');
        }
        res.json(result).status(200);
        console.log('berhasil mendapatkan semua keranjang');
    });
});

app.get('/keranjang/:id', (req, res) => {
    const id = req.params.id;
    dboperations.getkeranjangbyID(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(result).status(200);
        console.log(`berhasil mendapatkan keranjang dengan user id:${id}`);
    });
});

app.delete('/produk/:id', (req, res) => {
    const id = req.params.id;

    dboperations.deleteproduk(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);
    });
});

app.get('/umkm', (req, res) => {
    dboperations.getuserUMKM((error, result) => {
        if (error) {
            console.error('error get semua user UMKM:', error);
            return res.status(500).send('error fetch user UMKM (test purposes)');
        }
        res.json(result);
    });
});

app.post('/umkm', (req, res) => {
    const data = req.body;
    dboperations.registUMKM(data, (error, result) => {
        if (error) {
            console.error('error regist umkm:', error);
            return res.status(500).send('error nambah data umkm');
        }
        res.status(200).json(result);
    });
});

app.post('/login', (req, res) => {
    const { LoginEmail, LoginPassword, RememberMe } = req.body;

    dboperations.loginUMKM({ LoginEmail, LoginPassword }, (error, user) => {
        if (error) {
            return res.status(401).send(error.message);
        }
        res.status(200).json(result);
    });
});


// Route to get all messages
app.get('/message', (req, res) => {
    dboperations.getMessages((error, result) => {
        if (error) {
            console.error('Error fetching messages:', error);
            return res.status(500).send('Error fetching messages');
        }
        res.json(result);
    });
});

// Route to get messages by sender and receiver
app.get('/message/:senderType/:senderId/:receiverType/:receiverId', (req, res) => {
    const { senderType, senderId, receiverType, receiverId } = req.params;
    dboperations.getMessagesBySenderReceiver(senderType, senderId, receiverType, receiverId, (error, result) => {
        if (error) {
            console.error('Error fetching messages by sender and receiver:', error);
            return res.status(500).send('Error fetching messages');
        }
        res.json(result);
    });
});

// Route to send a message
app.post('/message', (req, res) => {
    const data = req.body;
    dboperations.sendMessage(data, (error, result) => {
        if (error) {
            console.error('Error sending message:', error);
            return res.status(500).send('Error sending message');
        }
        res.status(200).json(result);
    });
});

// Route to mark a message as read
app.put('/message/read/:id', (req, res) => {
    const { id } = req.params;
    dboperations.markMessageAsRead(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);
    });
});

// Route to delete a message
app.delete('/message/:id', (req, res) => {
    const { id } = req.params;
    dboperations.deleteMessage(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);
    });
});


// Get all pembeli
app.get('/pembeli', (req, res) => {
    dboperations.getPembeli((error, result) => {
        if (error) {
            console.error('Error fetching pembeli:', error);
            return res.status(500).send('Error fetching pembeli');
        }
        res.json(result);  // Send all pembeli data
    });
});

// Get pembeli by ID
app.get('/pembeli/:id', (req, res) => {
    const id = req.params.id;
    dboperations.getPembeliByID(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.json(result);  // Send pembeli data by ID
    });
});

// Add a new pembeli
app.post('/pembeli', (req, res) => {
    const data = req.body;
    dboperations.addPembeli(data, (error, result) => {
        if (error) {
            return res.status(500).send('Error adding pembeli');
        }
        res.status(200).json(result);  // Send the newly created pembeli
    });
});

// Update pembeli by ID
app.put('/pembeli/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;
    dboperations.updatePembeli(id, data, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);  // Send updated pembeli data
    });
});

// Delete pembeli by ID
app.delete('/pembeli/:id', (req, res) => {
    const id = req.params.id;
    dboperations.deletePembeli(id, (error, result) => {
        if (error) {
            return res.status(500).send(error.message);
        }
        res.status(200).json(result);  // Send success message
    });
});

// Get all kurirs
app.get('/kurir', async (req, res) => {
    try {
        const kurirs = await Kurir.findAll();
        res.json(kurirs);
    } catch (error) {
        console.error('Error fetching kurirs:', error);
        res.status(500).send('Error fetching kurirs');
    }
});

// Get kurir by ID
app.get('/kurir/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const kurir = await Kurir.findByPk(id);

        if (!kurir) {
            return res.status(404).send('Kurir not found');
        }

        res.json(kurir);
    } catch (error) {
        console.error('Error fetching kurir by ID:', error);
        res.status(500).send('Error fetching kurir by ID');
    }
});

// Add a new kurir
app.post('/kurir', async (req, res) => {
    try {
        const { nama_kurir, id_umkm, id_pesanan } = req.body;

        const newKurir = await Kurir.create({
            nama_kurir,
            id_umkm,
            id_pesanan
        });

        res.status(201).json(newKurir);
    } catch (error) {
        console.error('Error adding kurir:', error);
        res.status(500).send('Error adding kurir');
    }
});

// Update kurir by ID
app.put('/kurir/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { nama_kurir, id_umkm, id_pesanan } = req.body;

        const kurir = await Kurir.findByPk(id);

        if (!kurir) {
            return res.status(404).send('Kurir not found');
        }

        await kurir.update({ nama_kurir, id_umkm, id_pesanan });

        res.json(kurir);
    } catch (error) {
        console.error('Error updating kurir:', error);
        res.status(500).send('Error updating kurir');
    }
});

// Delete kurir by ID
app.delete('/kurir/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const kurir = await Kurir.findByPk(id);

        if (!kurir) {
            return res.status(404).send('Kurir not found');
        }

        await kurir.destroy();

        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Error deleting kurir:', error);
        res.status(500).send('Error deleting kurir');
    }
});

app.get('/monthly-stats/:umkmId', async (req, res) => {
    const { umkmId } = req.params;
    try {
        const stats = await dboperations.getMonthlyStatsByUMKM(umkmId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/daily-stats/:umkmId', async (req, res) => {
    const { umkmId } = req.params;
    const { month, year } = req.query; // Get month and year from query parameters

    try {
        const dailyStats = await dboperations.getDailyStatsByUMKM(umkmId, month, year); // Use the imported function
        res.json(dailyStats);
    } catch (error) {
        console.error('Error fetching daily stats:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/riwayat', async (req, res) => {
    try {
        const riwayat = await dboperations.getRiwayat();
        res.json(riwayat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Server Dapa
app.get('/getpesananmasuk', (req, res) => {
    dboperations.getpesananmasuk((error, result) => {
        if (error) {
            console.error('error get pesanan:', error);
            return res.status(500).send('error fetch pesanan');
        }
        res.json(result);
    });
});

app.get('/getpesananditerima', (req, res) => {
    dboperations.getpesananditerima((error, result) => {
        if (error) {
            console.error('error get pesanan:', error);
            return res.status(500).send('error fetch pesanan');
        }
        res.json(result);
    });
});

app.get('/getpesananditolak', (req, res) => {
    dboperations.getpesananditolak((error, result) => {
        if (error) {
            console.error('error get pesanan:', error);
            return res.status(500).send('error fetch pesanan');
        }
        res.json(result);
    });
});

app.get('/getpesananselesai', (req, res) => {
    dboperations.getpesananselesai((error, result) => {
        if (error) {
            console.error('error get pesanan:', error);
            return res.status(500).send('error fetch pesanan');
        }
        res.json(result);
    });
});

app.get('/getriwayatpesanan', (req, res) => {
    dboperations.getriwayatpesanan((error, result) => {
        if (error) {
            console.error('error get riwayat:', error);
            return res.status(500).send('error fetch riwayat');
        }
        res.json(result);
    });
});

app.post('/addriwayat', (req, res) => {
    const data = req.body;
    dboperations.addriwayat(data, (error, result) => {
        if (error) {
            console.error('error insert riwayat:', error);
            return res.status(500).send('error nambah riwayat');
        }
        res.status(200).json(result);
    });
});

app.post('/addpesanan', (req, res) => {
    const data = req.body;
    dboperations.addpesanan(data, (error, result) => {
        if (error) {
            console.error('error insert pesanan:', error);
            return res.status(500).send('error nambah pesanan');
        }
        res.status(200).json(result);
    });
});

app.put('/updatestatuspesananmasuk/:id', (req, res) => {
    const id = req.params.id;
    dboperations.updatestatuspesananmasuk(id, (error, result) => {
        if (error) {
            console.error('error update status pesanan diterima:', error);
            return res.status(500).send('error status pesanan diterima');
        }
        res.status(200).json(result);
    });
})

app.put('/updatestatuspesananditerima/:id', (req, res) => {
    const id = req.params.id;
    dboperations.updatestatuspesananditerima(id, (error, result) => {
        if (error) {
            console.error('error update status pesanan diterima:', error);
            return res.status(500).send('error status pesanan diterima');
        }
        res.status(200).json(result);
    });
})

app.put('/updatestatuspesananditolak/:id', (req, res) => {
    const id = req.params.id;
    dboperations.updatestatuspesananditolak(id, (error, result) => {
        if (error) {
            console.error('error update status pesanan diterima:', error);
            return res.status(500).send('error status pesanan diterima');
        }
        res.status(200).json(result);
    });
})

app.put('/updatestatuspesananselesai/:id', (req, res) => {
    const id = req.params.id;
    dboperations.updatestatuspesananselesai(id, (error, result) => {
        if (error) {
            console.error('error update status pesanan diterima:', error);
            return res.status(500).send('error status pesanan diterima');
        }
        res.status(200).json(result);
    });
})

// End Server Dapa

app.get('/getinboxpesanan', (req, res) => {
    dboperations.getinboxpesanan((error, result) => {
        if (error) {
            console.error('error get inbox:', error);
            return res.status(500).send('error fetch inbox pesanan');
        }
        res.json(result);
    });
});

app.listen(port, () => {
    console.log(`server berjalan di ${port}`);
});