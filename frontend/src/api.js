import axios from "axios";

const API = axios.create({
  baseURL: "https://task-manager-mern-lzhx.onrender.com/api",
});


// Add interceptor to automatically attach authorization token to request headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
