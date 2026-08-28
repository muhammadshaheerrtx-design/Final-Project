import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../api/client.js";
import { useCartCount } from "../context/CartContext.jsx";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../components/StateMessages.jsx";

export default function CartPage() {
  const navigate = useNavigate();
  const { refreshCartCount } = useCartCount();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getCart();
      setCart(result.data);
    } catch (err) {
      setLoadError(err.response?.data?.error || "Couldn't load your cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function handleQuantityChange(productId, quantity) {
    if (quantity < 1) return;
    setUpdatingId(productId);
    try {
      const result = await updateCartItem(productId, quantity);
      setCart(result.data);
      await refreshCartCount();
    } catch (err) {
      setActionError(err.response?.data?.error || "Couldn't update quantity.");
    } finally {
      setUpdatingId(null);
      setActionError(null);
    }
  }

  async function handleRemove(productId) {
    setUpdatingId(productId);
    try {
      const result = await removeCartItem(productId);
      setCart(result.data);
      await refreshCartCount();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't remove item.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading)
    return (
      <div className="page-content">
        <LoadingState label="Loading your cart…" />
      </div>
    );
  if (loadError)
    return (
      <div className="page-content">
        <ErrorState message={loadError} />
      </div>
    );

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <div className="page-content">
      <h1 className="page-title">Your Cart</h1>

      {items.length === 0 ? (
        <EmptyState label="Your cart is empty. Go find something you like." />
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.product._id} className="cart-row">
                <div className="cart-row-info">
                  <span className="eyebrow">{item.product.category}</span>
                  <span className="cart-row-name">{item.product.name}</span>
                  <span className="price">
                    ${item.product.price.toFixed(2)}
                  </span>
                </div>

                <div className="cart-row-controls">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.product._id,
                        Number(e.target.value),
                      )
                    }
                    disabled={updatingId === item.product._id}
                    className="qty-input"
                    aria-label={`Quantity for ${item.product.name}`}
                  />
                  <button
                    type="button"
                    className="btn-ghost small"
                    onClick={() => handleRemove(item.product._id)}
                    disabled={updatingId === item.product._id}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span className="price">${subtotal.toFixed(2)}</span>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/checkout")}
            >
              Proceed to checkout
            </button>
          </div>
        </>
      )}

      <Link to="/products" className="btn-ghost">
        ← Continue shopping
      </Link>
    </div>
  );
}
