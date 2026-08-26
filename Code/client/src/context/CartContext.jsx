import { createContext, useContext, useState, useCallback } from "react";
import { getCart } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setItemCount(0);
      return;
    }
    try {
      const result = await getCart();
      const count = result.data.items.reduce((sum, i) => sum + i.quantity, 0);
      setItemCount(count);
    } catch {}
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartCount() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartCount must be used inside a CartProvider");
  return ctx;
}
