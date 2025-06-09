// services/otp.service.js

const otpGenerator = require('otp-generator');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
require('dotenv').config(); // Untuk memuat variabel dari .env

// Konfigurasi SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const key = "koderahasia"; // Pastikan key ini konsisten

async function sendOTP(params, callback) {
    // 1. Generate OTP 4 digit
    const otp = otpGenerator.generate(4, {
        digits: true,
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false
    });

    const ttl = 1000 * 60 * 5; // Waktu hidup OTP 5 menit
    const expires = Date.now() + ttl;
    const data = `${params.email}.${otp}.${expires}`;

    // 2. Buat hash untuk verifikasi
    const hash = crypto.createHmac('sha256', key).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;

    // === PERMINTAAN ANDA: Cetak OTP di Terminal ===
    console.log(`[DEBUG MOBILE] OTP Lupa Password untuk ${params.email} adalah: ${otp}`);
    // ===============================================

    // 3. Siapkan email yang akan dikirim melalui SendGrid
    const msg = {
        to: params.email,
        from: process.env.EMAIL_FROM, // Email pengirim yang sudah diverifikasi di SendGrid
        subject: 'Kode OTP Ganti Password UMKMku',
        text: `Kode OTP Anda adalah ${otp}. Kode ini akan kedaluwarsa dalam 5 menit.`,
        html: `<p>Kode OTP Anda adalah <strong>${otp}</strong>. Kode ini akan kedaluwarsa dalam 5 menit.</p>`
    };

    try {
        // 4. Kirim email menggunakan SendGrid
        await sgMail.send(msg);
        
        // 5. Kirim kembali hash ke controller jika berhasil
        return callback(null, { hash: fullHash });

    } catch (error) {
        console.error("Error saat mengirim email dengan SendGrid:", error);
        // Kirim error ke controller jika gagal
        return callback(error);
    }
}

async function verifyOTP(params) {
    if (!params.hash) {
        throw new Error('Hash is missing');
    }

    const [hashValue, expires] = params.hash.split('.');
    if (Date.now() > parseInt(expires)) {
        throw new Error('OTP Telah Expire');
    }
    const data = `${params.email}.${params.otp}.${expires}`;
    const newCalculatedHash = crypto.createHmac('sha256', key).update(data).digest('hex');
    if (newCalculatedHash !== hashValue) {
        throw new Error('OTP Telah Invalid');
    }
    return true;
}

module.exports = {
    sendOTP,
    verifyOTP
};