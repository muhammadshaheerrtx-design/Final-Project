import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/client.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [devToken, setDevToken] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await forgotPassword(email);
      setSubmitted(true);
      setDevToken(result.data.devResetToken || null);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page centered">
      <div className="auth-card">
        <h1 className="brand">Reset Password</h1>
        <p className="brand-sub">Enter your account email to get a reset token.</p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            {error && <p className="error-text" role="alert">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending…" : "Send reset token"}
            </button>
          </form>
        ) : (
          <div className="auth-form">
            <p className="success-text">
              If that email is registered, a reset token was generated.
            </p>
            {devToken && (
              <div className="dev-token-box">
                <span className="eyebrow">Dev mode — reset token</span>
                <code>{devToken}</code>
              </div>
            )}
            <Link to="/reset-password" className="btn-primary">
              Continue to reset password
            </Link>
          </div>
        )}

        <p className="auth-footer-link">
          <Link to="/login">← Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
