var nodemailer = require('nodemailer');

async function sendEmail(params, callback) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'lorna.eichmann62@ethereal.email',
            pass: 'bhjep9jtNA5ggGtEnx'
        }
    });

    var mailOptions = {
        from: 'zfersya@gmail.com',
        to: params.email,
        subject: params.subject,
        text: params.body
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            return callback(error);
        } else {
            return callback(null, info.response);
        }
    });


}

module.exports = {
    sendEmail
}
