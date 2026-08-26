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

// ---- Auth ----
export const login = (email, password) =>
  api.post("/api/auth/login", { email, password }).then((r) => r.data);

export const register = (name, email, password) =>
  api.post("/api/auth/register", { name, email, password }).then((r) => r.data);

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
