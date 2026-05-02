import axios from "axios";
import { toast } from "react-toastify";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in the headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as is
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear the invalid token
      localStorage.removeItem("authToken");

      // Redirect to login page
      if (window.location.pathname !== "/login") {
        // Store the current path to redirect back after login (optional)
        localStorage.setItem("redirectAfterLogin", window.location.pathname);
        window.location.href = "/login";
      }

      // Suppress the error to avoid showing it to the user
      return Promise.reject(new Error("Unauthorized, redirecting to login..."));
    }

    // For other errors, let them propagate with a user-friendly message
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An error occurred while processing your request";
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export const GET = async (url, params = {}) => {
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    console.error("GET request failed:", error);
    throw error;
  }
};

export const POST = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return response.data;
  } catch (error) {
    console.error("POST request failed:", error);
    throw error;
  }
};

export const PUT = async (url, data = {}) => {
  try {
    const response = await apiClient.put(url, data);
    return response.data;
  } catch (error) {
    console.error("PUT request failed:", error);
    throw error;
  }
};

export const DELETE = async (url) => {
  try {
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error) {
    console.error("DELETE request failed:", error);
    throw error;
  }
};
