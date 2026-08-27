import { createContext, useContext, useState, useCallback } from "react";
import { getCart } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  // Any page that changes the cart calls this afterward so the navbar
  // badge stays accurate without every page needing to know about the
  // navbar directly.
  const refreshCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setItemCount(0);
      return;
    }
    try {
      const result = await getCart();
      const count = result.data.items.reduce((sum, i) => sum + i.quantity, 0);
      setItemCount(count);
    } catch {
      // Non-critical — the badge just won't update this time. Not worth
      // surfacing an error banner for a background count refresh.
    }
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
