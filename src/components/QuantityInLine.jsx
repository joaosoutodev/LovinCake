import { useState } from "react";

export default function QuantityInline({
  value = 1,
  min = 1,
  max = 99,
  onChange,
}) {
  const [v, setV] = useState(value);
  const clamp = (n) =>
    Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
  const commit = (n) => {
    const c = clamp(n);
    setV(c);
    onChange?.(c);
  };

  return (
    <div
      className="d-inline-flex align-items-stretch border rounded overflow-hidden"
      style={{ maxWidth: 180 }}
    >
      <button
        type="button"
        className="btn btn-outline-secondary border-0 rounded-0 px-3"
        onClick={() => commit(v - 1)}
      >
        -
      </button>
      <input
        className="form-control border-0 text-center"
        style={{ width: 64 }}
        value={v}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          setV(Number.isFinite(n) ? n : "");
        }}
        onBlur={() => commit(Number(v))}
        inputMode="numeric"
        aria-label="Quantity"
      />
      <button
        type="button"
        className="btn btn-outline-secondary border-0 rounded-0 px-3"
        onClick={() => commit(v + 1)}
      >
        +
      </button>
    </div>
  );
}
