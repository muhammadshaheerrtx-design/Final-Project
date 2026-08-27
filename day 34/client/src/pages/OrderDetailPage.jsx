import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder } from "../api/client.js";
import { LoadingState, ErrorState } from "../components/StateMessages.jsx";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrder() {
      setLoading(true);
      setError(null);
      try {
        const result = await getOrder(id);
        if (!cancelled) setOrder(result.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || "Couldn't load this order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="page-content"><LoadingState label="Loading order…" /></div>;
  if (error) return <div className="page-content"><ErrorState message={error} /></div>;
  if (!order) return null;

  return (
    <div className="page-content">
      <button type="button" className="btn-ghost" onClick={() => navigate("/orders")}>
        ← Back to orders
      </button>

      <h1 className="page-title">Order #{order._id.slice(-8)}</h1>
      <p className="order-date">
        Placed{" "}
        {new Date(order.createdAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <ul className="cart-list read-only">
        {order.items.map((item, idx) => (
          <li key={idx} className="cart-row">
            <div className="cart-row-info">
              <span className="cart-row-name">
                {item.name} × {item.quantity}
              </span>
              <span className="state-text muted">${item.priceAtPurchase.toFixed(2)} each</span>
            </div>
            <span className="price">${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>Subtotal</span>
          <span className="price">${order.subtotal.toFixed(2)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="cart-summary-row discount">
            <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
            <span className="price">-${order.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="cart-summary-row total">
          <span>Total</span>
          <span className="price">${order.total.toFixed(2)}</span>
        </div>
        <span className={`status-pill status-${order.status}`}>{order.status}</span>
      </div>
    </div>
  );
}
