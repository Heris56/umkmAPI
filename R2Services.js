const { S3Client, PutObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();
const { NodeHttpHandler } = require("@smithy/node-http-handler");
// const https = require('https');

// const agent = new https.Agent({
//   minVersion: 'TLSv1.2',
//   maxVersion: 'TLSv1.3',
//   honorCipherOrder: true
// });

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
    // requestHandler: new NodeHttpHandler({ httpsAgent: agent })
    requestHandler: new NodeHttpHandler({}) // Gunakan ini untuk membiarkan Node.js negosiasi TLS secara default
});

const uploadfile = async (bucketName, fileName, fileContent, mimetype) => {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: mimetype,
        ContentDisposition: 'inline',
    });

    try {
        const data = await r2.send(command);
        console.log("berhasil upload file", data);

    } catch (err) {
        console.error("Error ketika upload file", err);
    }
}

module.exports = {
    uploadfile
}
