const CryptoJS = require("crypto-js");

const key = CryptoJS.enc.Utf8.parse(process.env.AES_KEY); // 32-byte key from .env
const iv = CryptoJS.enc.Utf8.parse(process.env.AES_IV);   // 16-byte IV from .env

function encryptAES(data) {
    const jsonData = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
}

function decryptAES(encryptedString) {
    const decrypted = CryptoJS.AES.decrypt(encryptedString, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}

// Middleware to decrypt incoming requests if payload exists
function decryptRequest(req, res, next) {
    if (req.body && req.body.payload) {
        try {
            req.body = decryptAES(req.body.payload);
        } catch (e) {
            return res.status(400).json({ message: "Invalid encrypted payload" });
        }
    }
    next();
}

// Middleware to encrypt all outgoing responses
function encryptResponse(req, res, next) {
    const originalJson = res.json;
    res.json = function (data) {
        // Only encrypt if not already encrypted
        if (data && !data.payload) {
            return originalJson.call(this, { payload: encryptAES(data) });
        }
        return originalJson.call(this, data);
    };
    next();
}

module.exports = {
    decryptRequest,
    encryptResponse,
    encryptAES,
    decryptAES
};
