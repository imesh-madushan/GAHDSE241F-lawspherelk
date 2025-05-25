import axios from "axios";
import { decryptAES, encryptAES } from "../utils/Aes";


export const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Encrypt all outgoing data
apiClient.interceptors.request.use((config) => {
  if (config.data) {
    config.data = JSON.stringify({ payload: encryptAES(config.data) });
  }
  return config;
});

// Decrypt if backend sends encrypted
apiClient.interceptors.response.use((response) => {
  if (response.data?.payload) {
    try {
      response.data = decryptAES(response.data.payload);
    } catch {
      console.warn("Failed to decrypt response");
    }
  }
  return response;
});