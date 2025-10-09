import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
});

// Add token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Standardize response handling
API.interceptors.response.use(
  (response) => {
    // Log API calls in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);
    }
    
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    
    return Promise.reject(error);
  }
);

export default API;
