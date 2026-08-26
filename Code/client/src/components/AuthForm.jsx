import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, register as apiRegister } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthForm() {
  const { login: setSession } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result =
        mode === "login" ? await apiLogin(email, password) : await apiRegister(name, email, password);

      setSession(result.data.token, result.data.user);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1 className="brand">General Store</h1>
      <p className="brand-sub">Everything you need, nothing you don't.</p>

      <div className="auth-tabs">
        <button
          type="button"
          className={mode === "login" ? "tab active" : "tab"}
          onClick={() => setMode("login")}
        >
          Log in
        </button>
        <button
          type="button"
          className={mode === "register" ? "tab active" : "tab"}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === "register" && (
          <label className="field">
            <span>Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        )}

        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
