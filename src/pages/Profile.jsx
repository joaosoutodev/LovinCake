// src/pages/Profile.jsx
// Profile page:
// - Loads profile from context or API
// - Shows role badge and avatar (defaults per role)
// - Allows editing name/phone/avatar (demo accounts are read-only)

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, upsertProfile } from "../lib/profileApi";

export default function Profile() {
  const { user, profile: ctxProfile, refreshProfile } = useAuth();

  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [role, setRole] = useState("user");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Fallback display name from email prefix
  const emailName = useMemo(
    () => user?.email?.split("@")[0] ?? "user",
    [user?.email]
  );

  const isDemo = role === "demo";
  const effectiveAvatar = avatarUrl || `/img/avatars/${role || "user"}.svg`;

  // Load profile from context if available, otherwise fetch
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const p = ctxProfile || (await getProfile(user.id).catch(() => null));

      const full_name = p?.full_name || emailName;
      const phone = p?.phone || "";
      const r = (p?.role || "user").toLowerCase();
      const av = p?.avatar_url || "";

      if (alive) {
        setForm({ full_name, phone });
        setRole(r);
        setAvatarUrl(av);
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user?.id, ctxProfile, emailName]);

  if (!user) return <p className="text-muted">Please log in.</p>;
  if (loading) return <p className="text-muted">Loading…</p>;

  // Persist profile changes (role is not editable here)
  async function save() {
    if (isDemo) return;
    setMsg("");
    await upsertProfile({
      user_id: user.id,
      full_name: form.full_name,
      phone: form.phone,
      avatar_url: avatarUrl || null, // null => use role-based default
    });
    await refreshProfile?.();
    setMsg("Saved ✅");
  }

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="mb-0">Profile</h1>
        <span
          className={`badge text-bg-${
            role === "admin" ? "primary" : role === "demo" ? "warning" : "secondary"
          }`}
        >
          {role.toUpperCase()}
        </span>
      </div>

      <div className="d-flex align-items-center gap-3 mb-4">
        <img
          src={effectiveAvatar}
          alt="Avatar"
          width={96}
          height={96}
          className="rounded-circle border"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.src = "/img/avatars/user.svg";
          }}
        />
        <div className="text-muted">
          <div>
            <strong>{form.full_name || emailName}</strong>
          </div>
          <div>{user.email}</div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Full name</label>
        <input
          className="form-control"
          value={form.full_name}
          onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
          disabled={isDemo}
        />
        {isDemo && <small className="text-muted">Demo accounts are read-only.</small>}
      </div>

      <div className="mb-3">
        <label className="form-label">Phone</label>
        <input
          className="form-control"
          value={form.phone}
          onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          disabled={isDemo}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Avatar URL (optional)</label>
        <input
          className="form-control"
          placeholder="https://…"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          disabled={isDemo}
        />
        <small className="text-muted">Leave empty to use the default {role} avatar.</small>
      </div>

      {!isDemo && (
        <button className="btn btn-primary" onClick={save}>
          Save changes
        </button>
      )}
      {msg && <span className="ms-3 text-success">{msg}</span>}
    </div>
  );
}
