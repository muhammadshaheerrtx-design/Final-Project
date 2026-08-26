import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCartCount } from "../context/CartContext.jsx";

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCartCount();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/products" className="wordmark">
          General&nbsp;Store
        </Link>

        {isAuthenticated && (
          <nav className="nav-links">
            <Link to="/products">Shop</Link>
            <Link to="/orders">Orders</Link>
            {isAdmin && <Link to="/admin/products">Admin</Link>}
          </nav>
        )}

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="cart-link">
                Cart
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>
              <span className="nav-user">{user?.email}</span>
              <button type="button" className="btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-ghost">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
