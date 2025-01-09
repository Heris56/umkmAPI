const otpController = require('../controller/otp.contoller');

const express = require('express');
const router = express.Router();

router.post('/sendOTP', otpController.otpLogin);
router.post('/verifyOTP', otpController.verifyOTP);

module.exports = router;