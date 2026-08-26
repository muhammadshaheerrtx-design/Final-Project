import { useEffect, useState, useCallback } from "react";
import { getProducts, addCartItem } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCartCount } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import ProductToolbar from "../components/ProductToolbar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "../components/StateMessages.jsx";

export default function ProductListPage() {
  const { isAuthenticated } = useAuth();
  const { refreshCartCount } = useCartCount();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  const [addingId, setAddingId] = useState(null);
  const [addError, setAddError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const result = await getProducts(params);
      setProducts(result.data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load products.");
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function handleAddToCart(product) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setAddingId(product._id);
    setAddError(null);
    try {
      await addCartItem(product._id, 1);
      await refreshCartCount();
    } catch (err) {
      setAddError(err.response?.data?.error || "Couldn't add to cart.");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Shop</h1>

      <ProductToolbar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        sort={sort}
        onSortChange={setSort}
      />

      {addError && <ErrorState message={addError} />}

      {loading && <LoadingState label="Loading products…" />}
      {!loading && error && <ErrorState message={error} />}
      {!loading && !error && products.length === 0 && (
        <EmptyState label="No products match your filters." />
      )}

      {!loading && !error && products.length > 0 && (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onAddToCart={handleAddToCart}
              addingId={addingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
