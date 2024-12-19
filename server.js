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

app.listen(port, () => {
    console.log(`server berjalan di ${port}`);
});