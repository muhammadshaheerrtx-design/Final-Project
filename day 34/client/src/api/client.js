import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not set. Check your client/.env file.");
}

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

// Lets AuthContext register a callback without api.js needing to import
// React/context directly. Only fires for a 401 on a request that WAS
// carrying a token — a wrong-password 401 on /login must not trigger
// this, since the user was never logged in to begin with.
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && hadToken && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const login = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const register = (name, email, password) =>
  api.post("/api/auth/register", { name, email, password }).then((r) => r.data);

export const forgotPassword = (email) =>
  api.post("/api/auth/forgot-password", { email }).then((r) => r.data);

export const resetPassword = (token, newPassword) =>
  api.post("/api/auth/reset-password", { token, newPassword }).then((r) => r.data);

// ---- Products ----
export const getProducts = (params) =>
  api.get("/api/products", { params }).then((r) => r.data);

export const getProduct = (id) =>
  api.get(`/api/products/${id}`).then((r) => r.data);

export const createProduct = (data) =>
  api.post("/api/products", data).then((r) => r.data);

export const updateProduct = (id, data) =>
  api.patch(`/api/products/${id}`, data).then((r) => r.data);

export const deleteProduct = (id) =>
  api.delete(`/api/products/${id}`).then((r) => r.data);

// ---- Cart ----
export const getCart = () => api.get("/api/cart").then((r) => r.data);

export const addCartItem = (productId, quantity) =>
  api.post("/api/cart/items", { productId, quantity }).then((r) => r.data);

export const updateCartItem = (productId, quantity) =>
  api.patch(`/api/cart/items/${productId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (productId) =>
  api.delete(`/api/cart/items/${productId}`).then((r) => r.data);

// ---- Coupons ----
export const validateCoupon = (code) =>
  api.post("/api/coupons/validate", { code }).then((r) => r.data);

// ---- Orders ----
export const checkout = (couponCode) =>
  api.post("/api/orders", couponCode ? { couponCode } : {}).then((r) => r.data);

export const getOrders = () => api.get("/api/orders").then((r) => r.data);

export const getOrder = (id) => api.get(`/api/orders/${id}`).then((r) => r.data);

export default api;
