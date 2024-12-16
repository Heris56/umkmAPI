const express = require('express');
const dboperations = require('./query');

const app = express();
const port = process.env.PORT || 3000;

app.get('/barang', (req, res) => {
    dboperations.getbarang((error, result) => {
        if (error) {
            console.error('error get barang:', error);
            return res.status(500).send('error fetch barang');
        }
        res.json(result.recordset);
    });
});

app.listen(port, () => {
    console.log(`server berjalan di http://localhost:${port}`);
});