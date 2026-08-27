import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, addCartItem } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCartCount } from "../context/CartContext.jsx";
import { LoadingState, ErrorState } from "../components/StateMessages.jsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCartCount();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const result = await getProduct(id);
        if (!cancelled) setProduct(result.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || "Couldn't load this product.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setAdding(true);
    setAddError(null);
    setAdded(false);
    try {
      await addCartItem(product._id, quantity);
      await refreshCartCount();
      setAdded(true);
    } catch (err) {
      setAddError(err.response?.data?.error || "Couldn't add to cart.");
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="page-content"><LoadingState label="Loading product…" /></div>;
  if (error) return <div className="page-content"><ErrorState message={error} /></div>;
  if (!product) return null;

  const outOfStock = product.stock === 0;

  return (
    <div className="page-content">
      <button type="button" className="btn-ghost" onClick={() => navigate("/products")}>
        ← Back to shop
      </button>

      <div className="product-detail">
        <div className="product-detail-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <span>{product.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="product-detail-info">
          <span className="eyebrow">{product.category}</span>
          <h1 className="page-title">{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <p className="price large">${product.price.toFixed(2)}</p>
          <p className="stock-note">
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </p>

          {!outOfStock && (
            <div className="add-to-cart-row">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="qty-input"
                aria-label="Quantity"
              />
              <button type="button" className="btn-primary" onClick={handleAddToCart} disabled={adding}>
                {adding ? "Adding…" : "Add to cart"}
              </button>
            </div>
          )}

          {added && <p className="success-text">Added to cart.</p>}
          {addError && <ErrorState message={addError} />}
        </div>
      </div>
    </div>
  );
}
