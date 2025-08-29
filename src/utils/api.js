import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// Log configuration for debugging
console.log("API configured with baseURL:", api.defaults.baseURL);

// Request interceptor to attach token on each request
// Attach token to each request using lowercase header name
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["authorization"] = `Bearer ${token}`;
    console.log("Added auth token to request:", config.url);
  } else {
    console.log("No token available for request:", config.url);
  }
  return config;
});

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log("API response success:", response.config.url);
    return response;
  },
  (error) => {
    console.error("API response error:", error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default api;
