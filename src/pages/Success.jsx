// src/pages/Success.jsx
// Displays order success details after checkout.
// - Reads ?token from the URL
// - Fetches order via Supabase RPC
// - Shows loading/error states and an order summary

import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatEUR } from "../utils/format";

export default function Success() {
  const [sp] = useSearchParams();
  const token = sp.get("token");

  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch order details once we have a token
  useEffect(() => {
    let alive = true;

    async function run() {
      if (!token) {
        setErr("Missing token");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc("get_order_by_token", {
          p_token: token,
        });
        if (error) throw error;
        // RPC returns an array; take the first item
        if (alive) setOrder((data || [])[0] || null);
      } catch (e) {
        if (alive) setErr(e.message || String(e));
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      // Avoid state updates after unmount
      alive = false;
    };
  }, [token]);

  // Loading / error / empty states
  if (loading) return <p className="text-muted">Loading…</p>;
  if (err) return <div className="alert alert-danger">Error: {err}</div>;
  if (!order) return <p className="text-muted">Order not found.</p>;

  // Render order summary
  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <h1 className="mb-3">Thanks for your order!</h1>
      <p className="text-muted">Order ID: {order.id.slice(0, 8)}</p>

      <ul className="list-group mb-3">
        {(order.lines || []).map((li, i) => (
          <li key={i} className="list-group-item d-flex justify-content-between">
            <span>
              {li.name} × {li.qty}
            </span>
            <span>{formatEUR(li.price * li.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="d-flex justify-content-between">
        <strong>Total</strong>
        <strong>{formatEUR(order.total || 0)}</strong>
      </div>

      <Link to="/" className="btn btn-primary mt-4">
        Back to shop
      </Link>
    </div>
  );
}
