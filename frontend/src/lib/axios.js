import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.mode === "development" ? "http://localhost:3000/api" : "/api",
  withCredentials: true,
});

export default axiosInstance;