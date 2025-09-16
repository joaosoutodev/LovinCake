// src/pages/Home.jsx
// Home page:
// - Loads products and supports search, category filter, and sorting
// - Syncs filters to the URL (?q=&cat=&sort=)
// - Shows loading placeholders, error state, and product grid
// - Includes optional Greeting (reads profile display name if logged in)

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../lib/profileApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import DemoBanner from "../components/DemoBanner";

const SORTS = [
  { key: "relevance", label: "Relevance" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
];

export default function Home() {
  // 1) Hooks at the top; avoid early returns
  const { data, loading, err } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [cat, setCat] = useState(searchParams.get("cat") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");

  useDocumentTitle("Cakes • Lovin'cake");

  // Small greeting using the profile display name (if logged in)
  function Greeting() {
    const { user } = useAuth();
    const [name, setName] = useState("");

    useEffect(() => {
      (async () => {
        if (!user) {
          setName("");
          return;
        }
        const p = await getProfile(user.id);
        setName(p?.display_name || "");
      })();
    }, [user]);

    if (!user) return null;
    return <p className="mb-3">Welcome back{name ? `, ${name}` : ""}! 🍰</p>;
  }

  // 2) Keep URL in sync with current filters
  useEffect(() => {
    const next = {};
    if (q) next.q = q;
    if (cat !== "all") next.cat = cat;
    if (sort !== "relevance") next.sort = sort;
    setSearchParams(next, { replace: true });
  }, [q, cat, sort, setSearchParams]);

  // 3) Compute derived data (even while loading/err to keep refs stable)
  const safeData = Array.isArray(data) ? data : [];

  const CATEGORIES = useMemo(
    () => ["all", ...Array.from(new Set(safeData.map((p) => p.category)))],
    [safeData]
  );

  const products = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = safeData.filter((p) => {
      const hitName = p.name.toLowerCase().includes(term);
      const hitTags = (p.tags || []).some((t) => t.toLowerCase().includes(term));
      const byCat = cat === "all" || p.category === cat;
      return byCat && (term === "" || hitName || hitTags);
    });
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [safeData, q, cat, sort]);

  // 4) Single return; render conditionally inside JSX
  return (
    <div>
      <h1 className="mb-3">Cakes</h1>
      <DemoBanner />
      {/* <Greeting /> Uncomment to show personalized greeting */}

      {/* Filters bar */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <input
            className="form-control"
            placeholder="Search cakes..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            disabled={loading}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            disabled={loading}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error state */}
      {err && <p className="text-danger">Error loading products.</p>}

      {/* Loading state with skeletons */}
      {loading && !err && (
        <div className="row g-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4">
              <div className="card placeholder-glow">
                <div className="ratio ratio-16x9 bg-light placeholder"></div>
                <div className="card-body">
                  <h5 className="card-title">
                    <span className="placeholder col-8"></span>
                  </h5>
                  <p className="card-text">
                    <span className="placeholder col-12"></span>
                  </p>
                  <span className="placeholder col-4"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Final list */}
      {!loading &&
        !err &&
        (products.length === 0 ? (
          <p className="text-muted">No items found.</p>
        ) : (
          <div className="row g-3">
            {products.map((p) => (
              <div key={p.id} className="col-12 col-sm-6 col-lg-4">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
