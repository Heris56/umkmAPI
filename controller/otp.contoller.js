const otpService = require("../services/otp.service");

exports.otpLogin = (req, res) => {
    otpService.sendOTP(req.body, (error, result) => {
        if (error) {
            return res.status(500).json({ 
                message: error.message,
                data: error
            });
        }
        return res.status(200).json({
            message: "OTP Sukses terkirim",
            data: result
        });
    });
};


exports.verifyOTP = async (req, res) => {
    const { email, otp, hash } = req.body;

    try {
        const result = await otpService.verifyOTP({ email, otp, hash });
        res.status(200).json({ verified: result });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};