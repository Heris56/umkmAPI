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

app.listen(port, () => {
    console.log(`server berjalan di ${port}`);
});