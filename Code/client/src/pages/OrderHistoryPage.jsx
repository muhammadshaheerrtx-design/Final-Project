import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/client.js";
import { LoadingState, EmptyState, ErrorState } from "../components/StateMessages.jsx";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setLoading(true);
      setError(null);
      try {
        const result = await getOrders();
        if (!cancelled) setOrders(result.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || "Couldn't load your orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-content">
      <h1 className="page-title">Order History</h1>

      {loading && <LoadingState label="Loading your orders…" />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && orders.length === 0 && (
        <EmptyState label="You haven't placed any orders yet." />
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order._id}>
              <Link to={`/orders/${order._id}`} className="order-summary-card">
                <div>
                  <span className="order-id">#{order._id.slice(-8)}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="order-item-count">{order.items.length} item(s)</span>
                  <span className="price">${order.total.toFixed(2)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
