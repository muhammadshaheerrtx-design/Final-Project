import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken, setUnauthorizedHandler } from "../api/client.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "store_token";
const USER_KEY = "store_user";

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    // Attached synchronously here (not in a useEffect) so a child
    // route's first request can never fire before the header is set.
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

  // Any request that comes back 401 with an expired/invalid token now
  // logs the user out and redirects to login, instead of leaving the
  // app in a broken half-authenticated state.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate("/login");
    });
  }, [navigate]);

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
