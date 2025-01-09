const otpGenerator = require('otp-generator');
const crypto = require('crypto');
const key = "koderahasia";
const emailService = require('../services/emailer.service');

async function sendOTP(params, callback){
    const otp = otpGenerator.generate(4, {
        digits: true, 
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false
        }
    );

    const ttl = 1000 * 60 * 5; 
    const expires = Date.now() + ttl;
    const data = `${params.email}.${otp}.${expires}`;
    const hash = crypto.createHmac('sha256', key).update(data).digest('hex');
    const fullHash = `${hash}.${expires}`;

    var otpMessage = 'Kode OTP Anda adalah ' + otp + ' \n Kode ini akan kadaluarsa dalam 5 menit.';
    var model = {
        email: params.email,
        subject: 'Kode OTP Ganti Password UMKMku',
        body: otpMessage
    };

    emailService.sendEmail(model, function(err, data){
        if(err){
            return callback(err);
        }else{
            return callback( {message: data, hash: fullHash});
        }
    });


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
}