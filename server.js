const express = require('express');
const dboperations = require('./query');

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

app.post('/login', async (req, res) => {
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

// Message Routes
// Get all messages between sender and receiver
app.get('/message', (req, res) => {
    const { senderId, receiverId, senderType, receiverType } = req.query;
    dboperations.getMessages(senderId, receiverId, senderType, receiverType, (error, result) => {
        if (error) {
            console.error('Error fetching messages:', error);
            return res.status(500).send('Error fetching messages');
        }
        res.json(result);
    });
});

// Send a new message
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

// Mark a message as read
app.put('/message/:id/read', (req, res) => {
    const messageId = req.params.id;
    dboperations.markMessageAsRead(messageId, (error, result) => {
        if (error) {
            console.error('Error marking message as read:', error);
            return res.status(500).send('Error marking message as read');
        }
        res.json(result);
    });
});

// Delete a message
app.delete('/message/:id', (req, res) => {
    const messageId = req.params.id;
    dboperations.deleteMessage(messageId, (error, result) => {
        if (error) {
            console.error('Error deleting message:', error);
            return res.status(500).send('Error deleting message');
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


app.listen(port, () => {
    console.log(`server berjalan di ${port}`);
});