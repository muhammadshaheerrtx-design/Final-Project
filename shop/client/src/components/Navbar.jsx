import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCartCount } from "../context/CartContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCartCount();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const onProductsPage = location.pathname === "/products";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleSearchChange(value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/products" className="wordmark">
          [ Store ]
        </Link>

        {onProductsPage && (
          <input
            type="text"
            className="navbar-search"
            placeholder="Search bar..."
            value={searchParams.get("q") || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search products"
          />
        )}

        <div className="navbar-right">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin/products" className="btn-ghost">
                  Admin
                </Link>
              )}
              <Link to="/orders" className="btn-ghost">
                Orders
              </Link>
              <Link to="/cart" className="btn-outline cart-link">
                Cart{itemCount > 0 ? ` (${itemCount})` : ""}
              </Link>
              <button type="button" className="btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-outline">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
