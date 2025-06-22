// utils/aes.js
import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Utf8.parse("abcd1234abcd1234"); // 32-byte key from .env
const iv = CryptoJS.enc.Utf8.parse("12341234");   // 16-byte IV from .env

export const encryptAES = (data) => {
  const jsonData = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonData, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // base64
};

export const decryptAES = (encryptedString) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedString, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};
