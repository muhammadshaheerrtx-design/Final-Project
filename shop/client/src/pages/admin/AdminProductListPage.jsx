import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/client.js";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../../components/StateMessages.jsx";

export default function AdminProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getProducts();
      setProducts(result.data);
    } catch (err) {
      setLoadError(err.response?.data?.error || "Couldn't load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setActionError(err.response?.data?.error || "Couldn't delete product.");
    } finally {
      setDeletingId(null);
      setActionError(null);
    }
  }

  return (
    <div className="page-content">
      <div className="admin-header-row">
        <h1 className="page-title">Admin — Products</h1>
        <Link to="/admin/products/new" className="btn-primary">
          + New Product
        </Link>
      </div>

      {loading && <LoadingState label="Loading products…" />}
      {!loading && loadError && <ErrorState message={loadError} />}
      {!loading && !loadError && products.length === 0 && (
        <EmptyState label="No products yet." />
      )}

      {!loading && !error && products.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td className="price">${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>{p.category}</td>
                <td className="admin-actions">
                  <Link
                    to={`/admin/products/${p._id}/edit`}
                    className="btn-ghost small"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="btn-ghost small danger"
                    onClick={() => handleDelete(p._id)}
                    disabled={deletingId === p._id}
                  >
                    {deletingId === p._id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
