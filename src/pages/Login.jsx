// src/pages/Login.jsx
// Login page:
// - Authenticates with Supabase (no sign-up here)
// - On success, syncs cart (local -> remote -> local) and redirects
// - Maps Supabase auth errors to user-friendly messages
// - Includes a Demo login button using env credentials

import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { syncLocalCartToSupabase, fetchCartFromSupabase } from "../lib/cartApi";

export default function Login() {
  const { lines, replaceAll, clear, addItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Normalize Supabase auth errors for the UI
  function mapSupabaseAuthError(error) {
    const msg = (error?.message || "").toLowerCase();
    const status = error?.status;

    if (status === 400 && (msg.includes("invalid") || msg.includes("credentials"))) {
      return "Incorrect email or password.";
    }
    if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
      return "Please confirm your email before logging in.";
    }
    if (status === 422 || msg.includes("validation")) {
      return "Invalid email or password format.";
    }
    if (status === 429 || msg.includes("rate")) {
      return "Too many attempts. Please try again in a moment.";
    }
    return "Failed to login. Please try again.";
  }

  // Handle login submit
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // 1) Authenticate with email/password
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authErr) throw authErr;

      // 2) Sync cart (push local -> remote, then pull remote -> local)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await syncLocalCartToSupabase(lines, user.id);
        const remoteLines = await fetchCartFromSupabase(user.id);

        if (Array.isArray(remoteLines)) {
          if (typeof replaceAll === "function") {
            replaceAll(remoteLines);
          } else {
            // Fallback if replaceAll is unavailable
            clear?.();
            remoteLines.forEach((li) => addItem?.(li.id, li.qty));
          }
        }
      }

      // 3) Redirect to original destination or home
      const to = location.state?.from?.pathname || "/";
      navigate(to, { replace: true });
    } catch (e) {
      console.error("Login error:", e);
      setErr(mapSupabaseAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xxl py-5">
      <h1 className="h3 mb-3">Login</h1>

      <form onSubmit={onSubmit} className="col-12 col-md-4 p-3 border rounded bg-white">
        {err && <div className="alert alert-danger">{err}</div>}

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="mt-3 d-grid gap-2">
          <DemoButton />
          <small>
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </small>
        </div>
      </form>
    </div>
  );
}

// Small demo-login helper using env credentials
export function DemoButton() {
  const nav = useNavigate();
  const { lines, replaceAll } = useCart();
  const [loading, setLoading] = useState(false);

  async function demoLogin() {
    try {
      setLoading(true);

      const email = import.meta.env.VITE_DEMO_EMAIL;
      const password = import.meta.env.VITE_DEMO_PASS;
      if (!email || !password) {
        throw new Error("Demo credentials missing (VITE_DEMO_EMAIL / VITE_DEMO_PASS).");
      }

      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw authErr;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user after demo login.");

      await syncLocalCartToSupabase(lines, user.id);
      const remoteLines = await fetchCartFromSupabase(user.id);
      replaceAll(remoteLines);

      nav("/");
    } catch (e) {
      console.error("Demo login failed:", e);
      alert(e.message || "Failed to log into demo account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-outline-info btn-sm"
      onClick={demoLogin}
      disabled={loading}
      title="Log in to a demo account"
    >
      {loading ? "Entering demo…" : "Demo"}
    </button>
  );
}
