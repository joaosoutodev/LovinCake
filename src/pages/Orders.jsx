// src/pages/Orders.jsx
// Orders page:
// - Requires an authenticated user
// - Fetches up to 50 most recent orders for the user from Supabase
// - Shows loading/empty states and a simple order list with totals and line items

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { formatEUR } from "../utils/format";
import DemoBanner from "../components/DemoBanner";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load orders on mount (and when user.id changes)
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, status, total, lines")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!alive) return;
      if (!error) setOrders(data || []);
      setLoading(false);
    })();

    return () => {
      // Prevent state updates after unmount
      alive = false;
    };
  }, [user?.id]);

  // Guard states
  if (!user) return <p className="text-muted">Please log in.</p>;
  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <h1 className="mb-3">Your Orders</h1>
      <DemoBanner />

      {!orders.length ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        <div className="vstack gap-3">
          {orders.map((o) => (
            <div className="card" key={o.id}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <span className={`badge ${badgeFor(o.status)}`}>
                      {o.status}
                    </span>
                    <div>
                      <div className="fw-semibold">Order #{o.id}</div>
                      <small className="text-muted">
                        {new Date(o.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>
                  <div className="fs-5">{formatEUR(o.total)}</div>
                </div>

                {Array.isArray(o.lines) && o.lines.length > 0 && (
                  <ul className="list-inline small text-muted mt-3 mb-0">
                    {o.lines.slice(0, 4).map((li, i) => (
                      <li className="list-inline-item me-3" key={i}>
                        {li.name} × {li.qty}
                      </li>
                    ))}
                    {o.lines.length > 4 && (
                      <li className="list-inline-item">
                        +{o.lines.length - 4} more
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Map order status to a Bootstrap badge style
function badgeFor(status = "") {
  const s = status.toLowerCase();
  if (s === "created") return "text-bg-secondary";
  if (s === "paid") return "text-bg-success";
  if (s === "shipped") return "text-bg-primary";
  if (s === "cancelled") return "text-bg-danger";
  return "text-bg-light";
}
