// src/pages/Product.jsx
// Product detail page:
// - Fetches products and finds the one matching :slug
// - Renders image, metadata, price, and quantity selector
// - Adds selected quantity to cart

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import { formatEUR } from "../utils/format";
import QuantityInput from "../components/QuantityInput";

// Join a public path with BASE_URL without producing double slashes
function joinPublicPath(p) {
  const base = import.meta.env.BASE_URL || "/";
  const clean = String(p || "").replace(/^\/+/, "");
  return `${base}${clean}`;
}

export default function Product() {
  // Hooks at the top (no early returns)
  const { slug } = useParams();
  const { addItem } = useCart();
  const { data, loading, err } = useProducts();
  const [qty, setQty] = useState(1);

  // Non-hook computation: find the product by slug
  const product = Array.isArray(data)
    ? data.find((p) => p.slug === slug)
    : undefined;

  // Single return; conditional branches inside JSX
  return (
    <div className="py-4 px-3">
      <nav className="mb-4">
        <Link to="/" className="text-decoration-none">
          ← Back to list
        </Link>
      </nav>

      {err && <div className="alert alert-danger">Error loading products.</div>}
      {loading && !err && <p className="text-muted">Loading…</p>}
      {!loading && !err && !product && (
        <p className="text-muted">Product not found.</p>
      )}

      {!loading && !err && product && (
        <div className="row justify-content-center g-5">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="ratio ratio-4x3 bg-light rounded shadow-sm overflow-hidden">
              {product.image ? (
                <img
                  src={joinPublicPath(product.image)}
                  alt={product.name}
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    // Fallback to a local placeholder if the image fails
                    e.currentTarget.src = joinPublicPath("img/placeholder-800x600.png");
                  }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center fs-1">
                  🍰
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-5">
            <h1 className="h2 mb-2">{product.name}</h1>

            <div className="mb-3">
              <span className="badge text-bg-secondary text-uppercase">
                {product.category}
              </span>
            </div>

            <p className="text-muted mb-3">{product.description}</p>
            <p className="fs-4 fw-semibold mb-4">{formatEUR(product.price)}</p>

            <div className="d-flex align-items-center gap-3 my-3 flex-nowrap">
              {/* Use controlled quantity input */}
              <QuantityInput value={qty} onChange={setQty} />
              <button
                className="btn btn-primary text-nowrap"
                onClick={() => addItem(product.id, qty)}
              >
                Add to cart
              </button>
            </div>

            {product.tags?.length ? (
              <small className="text-muted d-block mt-3">
                Tags: {product.tags.join(", ")}
              </small>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
