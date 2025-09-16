// src/pages/Dashboard.jsx
// Dashboard:
// - Loads recent orders for the authenticated user
// - Computes KPIs (total orders, revenue, average order value, last order date)
// - Renders a simple spark-bar trend and a table of latest orders

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { formatEUR } from "../utils/format";
import DemoBanner from "../components/DemoBanner";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch up to 20 latest orders for the current user
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!alive) return;
      if (!error) setOrders(data || []);
      setLoading(false);
    })();

    return () => {
      alive = false; // avoid state updates after unmount
    };
  }, [user?.id]);

  // Aggregate KPIs
  const kpi = useMemo(() => {
    if (!orders.length) {
      return { totalOrders: 0, totalRevenue: 0, avgOrder: 0, lastDate: null };
    }
    const totalRevenue = orders.reduce((a, o) => a + (Number(o.total) || 0), 0);
    const avgOrder = totalRevenue / orders.length;
    const lastDate = orders[0]?.created_at ? new Date(orders[0].created_at) : null;

    return { totalOrders: orders.length, totalRevenue, avgOrder, lastDate };
  }, [orders]);

  // Normalize totals to 0–100 for a mini bar chart
  const series = useMemo(() => {
    const arr = orders
      .slice()
      .reverse()
      .map((o) => Number(o.total) || 0);
    const max = Math.max(1, ...arr);
    return arr.map((v) => Math.round((v / max) * 100));
  }, [orders]);

  return (
    <div className="container" style={{ maxWidth: 1100 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="mb-0">Dashboard</h1>
        <Link to="/orders" className="btn btn-outline-secondary btn-sm">
          View all orders
        </Link>
      </div>

      <DemoBanner />

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <>
          {/* KPIs */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="kpi-card">
                <span className="kpi-label">Total orders</span>
                <span className="kpi-value">{kpi.totalOrders}</span>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="kpi-card">
                <span className="kpi-label">Revenue</span>
                <span className="kpi-value">{formatEUR(kpi.totalRevenue)}</span>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="kpi-card">
                <span className="kpi-label">Avg. order</span>
                <span className="kpi-value">{formatEUR(kpi.avgOrder)}</span>
              </div>
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="kpi-card">
                <span className="kpi-label">Last order</span>
                <span className="kpi-value">
                  {kpi.lastDate ? kpi.lastDate.toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Mini bar trend */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">
                Revenue trend (last {series.length} orders)
              </h5>
              <div className="mini-bars">
                {series.map((h, i) => (
                  <div
                    key={i}
                    className="mini-bar"
                    style={{ height: `${h}%` }}
                    title={`#${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Latest orders table */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Latest orders</h5>
              {!orders.length ? (
                <p className="text-muted mb-0">No orders yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 6).map((o) => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{new Date(o.created_at).toLocaleString()}</td>
                          <td>
                            <span className={`badge ${badgeFor(o.status)}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="text-end">{formatEUR(o.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
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
