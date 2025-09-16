import { Link } from "react-router-dom";
import { formatEUR } from "../utils/format";

export default function ProductCard({ product }) {
  return (
    <div className="card h-100">
      <div className="ratio ratio-16x9 bg-light">
        {/* fallback emoji if no image */}
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="card-img-top object-fit-cover"
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center fs-1">
            🍰
          </div>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text text-muted small mb-2">{product.description}</p>
        <div className="mt-auto d-flex align-items-center justify-content-between">
          <strong>{formatEUR(product.price)}</strong>
          <Link
            className="btn btn-primary btn-sm"
            to={`/product/${product.slug}`}
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
