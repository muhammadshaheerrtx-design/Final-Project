import { createContext, useContext, useState } from "react";
import { setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "store_token";
const USER_KEY = "store_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    setAuthToken(stored);
    return stored;
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  function login(newToken, newUser) {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === "admin",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
