// src/pages/Settings.jsx
// User settings page:
// - Loads current profile (full name, phone) on mount
// - Allows editing and saving via upsert
// - Shows lightweight loading/saving feedback

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, upsertProfile } from "../lib/profileApi";

export default function Settings() {
  const { user } = useAuth();

  const [values, setValues] = useState({ full_name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Load profile once (on mount / when user changes)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const p = await getProfile(user.id);
        if (mounted && p) {
          setValues({
            full_name: p.full_name || "",
            phone: p.phone || "",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user.id]);

  // Form state update
  const onChange = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  // Save profile
  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await upsertProfile({ user_id: user.id, ...values });
      setMsg("Saved!");
      setTimeout(() => setMsg(""), 1500);
    } catch (e2) {
      setMsg(e2.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <div className="container">
      <h1 className="mb-3">Settings</h1>

      {msg && <div className="alert alert-info">{msg}</div>}

      <form className="row g-3" onSubmit={onSave}>
        <div className="col-12 col-md-6">
          <label htmlFor="full_name" className="form-label">
            Full name
          </label>
          <input
            id="full_name"
            name="full_name"
            className="form-control"
            value={values.full_name}
            onChange={onChange}
            autoComplete="name"
          />
        </div>

        <div className="col-12 col-md-6">
          <label htmlFor="phone" className="form-label">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            className="form-control"
            value={values.phone}
            onChange={onChange}
            type="tel"
            autoComplete="tel"
          />
        </div>

        <div className="col-12">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
