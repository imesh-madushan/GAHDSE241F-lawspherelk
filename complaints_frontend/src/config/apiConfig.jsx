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
  // Don't encrypt FormData (for file uploads)
  if (config.data instanceof FormData) {
    // Remove Content-Type header to let browser set it with boundary
    delete config.headers['Content-Type'];
    return config;
  }

  if (config.data) {
    config.data = JSON.stringify({ payload: encryptAES(config.data) });
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Decrypt if backend sends encrypted
apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.payload) {
      try {
        response.data = decryptAES(response.data.payload);
      } catch {
        console.warn("Failed to decrypt response");
      }
    }
    return response;
  },
  (error) => {
    // Decrypt error response if encrypted
    if (
      error.response &&
      error.response.data &&
      error.response.data.payload
    ) {
      try {
        error.response.data = decryptAES(error.response.data.payload);
      } catch {
        console.warn("Failed to decrypt error response");
      }
    }
    return Promise.reject(error);
  }
);