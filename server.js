// server.js
const express = require('express');
const dboperations = require('./query');
const Kurir = require('./models/kurir');



const app = express();
const port = process.env.PORT || 80;


app.use(express.json());

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

app.get('/pesananmasuk', (req, res) => {
    dboperations.getpesananmasuk((error, result) => {
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
    console.log('Request body:', req.body);
    dboperations.addproduk(data, (error, result) => {
        if (error) {
            console.error('error insert produk:', error);
            return res.status(500).send('error nambah produk');
        }
        res.status(200).json(result);
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
            return res.status(401).send(error.message); // Unauthorized
        }

        if (RememberMe) {
            // cookies kalo RememberMe 
            res.cookie('LoginEmail', LoginEmail, { maxAge: 3600000 }); // 1 hour
            res.cookie('LoginPassword', LoginPassword, { maxAge: 3600000 }); // 1 hour
        } else {
            // hapus cookies kalo tidak RememberMe
            res.clearCookie('LoginEmail');
            res.clearCookie('LoginPassword');
        }

        // simpan user ke session
        // const users = await User.findAll();
        // req.session.users = users;

        res.redirect('/MainPage');
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
// API route for daily stats
app.get('/daily-stats/:umkmId', async (req, res) => {
    const { umkmId } = req.params;
    const { month, year } = req.query; // Get month and year from query parameters
    try {
        const dailyStats = await dboperations.getStatusBulan(umkmId, month, year);
        res.json(dailyStats);
    } catch (error) {
        console.error('Error fetching daily stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API route for monthly stats
app.get('/monthly-stats/:umkmId', async (req, res) => {
    const { umkmId } = req.params;
    try {
        const monthlyStats = await dboperations.getStatusOverAll(umkmId);
        res.json(monthlyStats);
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/riwayat', (req, res) => {
    dboperations.getRiwayat((error, result) => {
        if (error) {
            console.error('error get semua riwayat:', error);
            return res.status(500).send('error fetch user UMKM (test purposes)');
        }
        res.json(result);
    });
});


app.listen(port, () => {
    console.log(`server berjalan di ${port}`);
});