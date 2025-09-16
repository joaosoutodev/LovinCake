// src/pages/Signup.jsx
// Signup page:
// - Creates a new account with email/password
// - (Client-side) checks if the email already exists
// - Syncs local cart with Supabase cart after signup
// - Shows success/error feedback and redirects home

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { syncLocalCartToSupabase, fetchCartFromSupabase } from "../lib/cartApi";
import { useToast } from "../context/ToastContext";

export default function Signup() {
  const { signup } = useAuth();
  const { lines, replaceAll } = useCart();
  const nav = useNavigate();
  const toast = useToast?.();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // 1) Check if user already exists (Supabase Auth)
      const { data: existing, error: checkErr } =
        await supabase.auth.admin.listUsers({ email });

      if (checkErr) {
        console.error("Error checking user:", checkErr);
        throw new Error("Could not verify email. Please try again later.");
      }

      if (existing?.users?.length > 0) {
        setErr("This email is already registered. Please log in instead.");
        setLoading(false);
        return;
      }

      // 2) Create the account
      await signup(email, password);

      // 3) Sync cart from local to remote, then refresh from remote
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await syncLocalCartToSupabase(lines, user.id);
        const remoteLines = await fetchCartFromSupabase(user.id);
        replaceAll(remoteLines);
      }

      // 4) Success feedback
      if (toast?.success) {
        toast.success(`Account created! Welcome, ${email}!`);
      } else {
        alert(`Account created! Welcome, ${email}!`);
      }

      // 5) Redirect home
      nav("/");
    } catch (e) {
      console.error("Signup error:", e);
      setErr(e.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xxl py-5">
      <h1 className="h3 mb-3">Create Account</h1>

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
            autoComplete="new-password"
          />
        </div>

        <button className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <div className="mt-3">
          <small>
            Already have an account? <Link to="/login">Login</Link>
          </small>
        </div>
      </form>
    </div>
  );
}
