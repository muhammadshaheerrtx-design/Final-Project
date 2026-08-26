import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, validateCoupon, checkout } from "../api/client.js";
import { useCartCount } from "../context/CartContext.jsx";
import { LoadingState, ErrorState } from "../components/StateMessages.jsx";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { refreshCartCount } = useCartCount();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [placeError, setPlaceError] = useState(null);

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

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(couponInput.trim());
      setAppliedCoupon(result.data);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.error || "Couldn't validate that code.");
    } finally {
      setValidatingCoupon(false);
    }
  }

  async function handlePlaceOrder() {
    setPlacingOrder(true);
    setPlaceError(null);
    try {
      const result = await checkout(appliedCoupon?.code);
      await refreshCartCount();
      navigate(`/orders/${result.data._id}`);
    } catch (err) {
      setPlaceError(err.response?.data?.error || "Couldn't place your order.");
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) return <div className="page-content"><LoadingState label="Loading checkout…" /></div>;
  if (loadError) return <div className="page-content"><ErrorState message={loadError} /></div>;

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = appliedCoupon ? subtotal * (appliedCoupon.discountPercent / 100) : 0;
  const total = subtotal - discount;

  if (items.length === 0) {
    return (
      <div className="page-content">
        <h1 className="page-title">Checkout</h1>
        <p className="state-text muted">Your cart is empty — add something before checking out.</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Checkout</h1>

      <ul className="cart-list read-only">
        {items.map((item) => (
          <li key={item.product._id} className="cart-row">
            <div className="cart-row-info">
              <span className="cart-row-name">
                {item.product.name} × {item.quantity}
              </span>
            </div>
            <span className="price">${(item.product.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="coupon-row">
        <input
          type="text"
          placeholder="Coupon code"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value)}
        />
        <button type="button" className="btn-ghost" onClick={handleApplyCoupon} disabled={validatingCoupon}>
          {validatingCoupon ? "Checking…" : "Apply"}
        </button>
      </div>
      {couponError && <p className="error-text" role="alert">{couponError}</p>}
      {appliedCoupon && (
        <p className="success-text">
          {appliedCoupon.code} applied — {appliedCoupon.discountPercent}% off
        </p>
      )}

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span className="price">${subtotal.toFixed(2)}</span>
        </div>
        {appliedCoupon && (
          <div className="cart-summary-row discount">
            <span>Discount ({appliedCoupon.code})</span>
            <span className="price">-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="cart-summary-row total">
          <span>Total</span>
          <span className="price">${total.toFixed(2)}</span>
        </div>

        {placeError && <ErrorState message={placeError} />}

        <button type="button" className="btn-primary" onClick={handlePlaceOrder} disabled={placingOrder}>
          {placingOrder ? "Placing order…" : "Place order"}
        </button>
      </div>
    </div>
  );
}
