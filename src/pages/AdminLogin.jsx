// src/pages/AdminLogin.jsx

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { API_BASE } from "../config";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
      } else {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminRole", data.role);

        if (remember) {
          localStorage.setItem("adminRemember", "true");
        } else {
          localStorage.removeItem("adminRemember");
        }

        window.location.href = "/users";
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-bg">
        <div className="admin-login-orb admin-login-orb-one" />
        <div className="admin-login-orb admin-login-orb-two" />
        <div className="admin-login-grid" />
      </div>

      <section className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-login-icon">
            <KeyRound size={28} />
          </div>

          <div>
            <p className="admin-login-kicker">Secure Control Center</p>
            <h1>Admin Login</h1>
            <p className="admin-login-subtitle">NovaChain Admin Panel</p>
          </div>
        </div>

        <div className="admin-login-security">
          <ShieldCheck size={17} />
          <span>Protected admin access only</span>
        </div>

        {error && (
          <div className="admin-login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label className="admin-login-label">
            Email address
            <div className="admin-login-field">
              <Mail size={18} />
              <input
                ref={emailRef}
                type="email"
                placeholder="admin@novachain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </label>

          <label className="admin-login-label">
            Password
            <div className="admin-login-field">
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="admin-login-eye"
                onClick={() => setShowPassword((value) => !value)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <div className="admin-login-row">
            <label className="admin-login-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
              />
              <span>Remember this device</span>
            </label>

            <button type="button" className="admin-login-link">
              Forgot password?
            </button>
          </div>

          <button type="submit" className="admin-login-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="admin-login-spinner" />
                Signing in...
              </>
            ) : (
              "Sign in to dashboard"
            )}
          </button>
        </form>

        <p className="admin-login-footer">
          Only authorized NovaChain operators can access this panel.
        </p>
      </section>
    </main>
  );
}