import { Link } from "react-router-dom";

export default function ProductCard({ product, onAddToCart, addingId }) {
  const outOfStock = product.stock === 0;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-link">
        <div className="product-image-placeholder">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <span>{product.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="eyebrow">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
      </Link>

      <div className="product-card-footer">
        <span className="price">${product.price.toFixed(2)}</span>
        <button
          type="button"
          className="btn-primary small"
          onClick={() => onAddToCart(product)}
          disabled={outOfStock || addingId === product._id}
        >
          {outOfStock ? "Out of stock" : addingId === product._id ? "Adding…" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
