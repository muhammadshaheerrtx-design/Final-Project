import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/client.js";

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page centered">
      <div className="auth-card">
        <h1 className="brand">New Password</h1>
        <p className="brand-sub">Paste the reset token and choose a new password.</p>

        {done ? (
          <p className="success-text">Password updated. Redirecting to log in…</p>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>Reset token</span>
              <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required />
            </label>

            <label className="field">
              <span>New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            {error && <p className="error-text" role="alert">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>
        )}

        <p className="auth-footer-link">
          <Link to="/login">← Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
