import axios from "axios";
import { API_BASE_URL } from "../config";
import { getToken } from "../storage/tokenStorage";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await client({
      url: endpoint,
      ...options,
    });
    return { data: response.data, error: null };
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.message ||
      "An error occurred";
    return { data: null, error: message };
  }
};

export default client;
