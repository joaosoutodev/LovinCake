// src/pages/Checkout.jsx
// Checkout page:
// - Builds a normalized order from cart lines and product data
// - Supports guest checkout (email/name/shipping) or logged-in users
// - Uses invisible reCAPTCHA before calling a Supabase Edge Function ("checkout")
// - On success, clears cart and navigates to /success?token=...

import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";
import ReCAPTCHA from "react-google-recaptcha";

export default function Checkout() {
  const { user } = useAuth();
  const { lines, clear } = useCart();
  const { data: products } = useProducts();
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);

  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [shipping, setShipping] = useState({ address: "", city: "", zip: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Map product id -> product (defensive)
  const pmap = new Map(
    (Array.isArray(products) ? products : []).map((p) => [String(p.id), p])
  );

  // Normalize cart lines against product data
  const orderLines = lines
    .map((li) => {
      const p = pmap.get(String(li.id));
      const price = Number(p?.price ?? 0) || 0;
      const qty = Number(li.qty ?? 0) || 0;
      return { id: li.id, name: p?.name ?? "Unknown", price, qty };
    })
    .filter((li) => li.qty > 0);

  const total = orderLines.reduce((a, li) => a + li.price * li.qty, 0);

  async function submitOrder(e) {
    e.preventDefault();
    setErr("");

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    // Basic guards
    if (!user && !guestEmail.trim()) {
      setErr("Please provide an email to continue as guest.");
      return;
    }
    if (orderLines.length === 0) {
      setErr("Your cart is empty.");
      return;
    }
    if (!siteKey) {
      setErr("reCAPTCHA is not configured (missing VITE_RECAPTCHA_SITE_KEY).");
      return;
    }
    if (!recaptchaRef.current || !recaptchaRef.current.executeAsync) {
      setErr("reCAPTCHA is not ready. Please try again.");
      return;
    }

    setLoading(true);
    try {
      // Execute invisible reCAPTCHA
      const token = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset();
      if (!token) throw new Error("Failed to verify reCAPTCHA.");

      // Build payload for the Edge Function
      const payload = {
        user_id: user ? user.id : null,
        guest_email: user ? null : guestEmail.trim(),
        guest_name: user ? null : guestName.trim() || null,
        shipping: user
          ? null
          : {
              address: shipping.address.trim(),
              city: shipping.city.trim(),
              zip: shipping.zip.trim(),
            },
        status: "created",
        total,
        lines: orderLines,
        token, // consumed by the Edge Function
      };

      // Invoke Supabase Edge Function "checkout"
      const { data: resp, error: fnErr } = await supabase.functions.invoke(
        "checkout",
        { body: payload }
      );
      if (fnErr) throw new Error(fnErr.message || "Failed to place order.");

      if (!resp?.order_token) {
        throw new Error("Checkout completed but no order token returned.");
      }

      clear();
      navigate(`/success?token=${resp.order_token}`);
    } catch (e) {
      console.error("Checkout error:", e);
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = loading || orderLines.length === 0;

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h1 className="mb-3">Checkout</h1>

      {err && <div className="alert alert-danger">{err}</div>}

      {!user && (
        <div className="alert alert-info">
          You can checkout as a guest or <Link to="/login">log in</Link> for faster checkout next time.
        </div>
      )}

      {/* Order summary */}
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title mb-3">Order summary</h5>
          {orderLines.length === 0 ? (
            <p className="text-muted mb-0">Your cart is empty.</p>
          ) : (
            <>
              <ul className="list-group list-group-flush">
                {orderLines.map((li) => (
                  <li
                    key={li.id}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <span>
                      {li.name} × {li.qty}
                    </span>
                    <span>€ {(li.price * li.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between pt-3">
                <strong>Total</strong>
                <strong>€ {total.toFixed(2)}</strong>
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={submitOrder} className="vstack gap-3">
        {!user && (
          <>
            <div>
              <label className="form-label">Email (guest)</label>
              <input
                className="form-control"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Full name (optional)</label>
              <input
                className="form-control"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label">Address</label>
                <input
                  className="form-control"
                  value={shipping.address}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, address: e.target.value }))
                  }
                />
              </div>
              <div className="col-6">
                <label className="form-label">City</label>
                <input
                  className="form-control"
                  value={shipping.city}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, city: e.target.value }))
                  }
                />
              </div>
              <div className="col-6">
                <label className="form-label">ZIP</label>
                <input
                  className="form-control"
                  value={shipping.zip}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, zip: e.target.value }))
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* Invisible reCAPTCHA (public site key) */}
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          size="invisible"
        />

        <button className="btn btn-primary" disabled={isDisabled}>
          {loading ? "Placing order..." : "Place order"}
        </button>
      </form>
    </div>
  );
}
