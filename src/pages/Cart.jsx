import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../hooks/useProducts";
import { formatEUR } from "../utils/format";

function joinPublicPath(p) {
  const base = import.meta.env.BASE_URL || "/";
  return base + String(p || "").replace(/^\/+/, "");
}

export default function Cart() {
  const { lines, count, clear, inc, dec, remove } = useCart();
  const { data, loading, err } = useProducts();

  // Sempre define products ANTES de tentar usar pmap
  const products = Array.isArray(data) ? data : [];
  const pmap = new Map(products.map((p) => [Number(p.id), p]));
  const cartLines = lines.map((ci) => ({
    ...ci,
    product: pmap.get(Number(ci.id)),
  }));

  if (loading) return <p className="text-muted">Loading…</p>;
  if (err)
    return <div className="alert alert-danger">Error loading products.</div>;
  if (count === 0)
    return (
      <div className="text-center py-5">
        <p className="text-muted mb-3">Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">
          Back to shop
        </Link>
      </div>
    );

  const subtotal = cartLines.reduce(
    (a, li) => a + (li.qty || 0) * (li.product?.price || 0),
    0,
  );

  return (
    <div>
      <h1 className="mb-4">Your Cart</h1>

      <ul className="list-group mb-4">
        {cartLines.map((li) => (
          <li
            key={li.id}
            className="list-group-item d-flex align-items-center gap-3"
          >
            {/* Thumbnail */}
            <div className="flex-shrink-0" style={{ width: 80 }}>
              <div className="ratio ratio-1x1 bg-light rounded overflow-hidden">
                {li.product?.image ? (
                  <img
                    src={joinPublicPath(li.product.image)} // ex.: "img/choco.jpg" em public/
                    alt={li.product?.name || "Item"}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src = joinPublicPath(
                        "img/placeholder-800x600.png",
                      );
                    }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center">
                    🍰
                  </div>
                )}
              </div>
            </div>

            {/* Detalhes */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between">
                <strong>{li.product?.name || "Unknown item"}</strong>
                <span>{formatEUR((li.product?.price || 0) * li.qty)}</span>
              </div>
              <small className="text-muted">
                {li.product?.category ?? "No category"}
              </small>

              <div className="d-flex align-items-center gap-2 mt-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => dec(li.id)}
                >
                  -
                </button>
                <span>{li.qty}</span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => inc(li.id)}
                >
                  +
                </button>
                <button
                  className="btn btn-sm btn-link text-danger ms-3"
                  onClick={() => remove(li.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="card">
        <div className="card-body d-flex justify-content-between align-items-center">
          <span className="fw-bold">Subtotal</span>
          <span className="fs-5">{formatEUR(subtotal)}</span>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-outline-danger" onClick={clear}>
          Clear cart
        </button>
        <Link to="/checkout" className="btn btn-primary">
          Go to checkout
        </Link>
      </div>
    </div>
  );
}
