// src/hooks/useProducts.js
import { useEffect, useState } from "react";

let cachedProducts = null; // <-- Singleton-like cache (shared between calls)

export function useProducts() {
  const [data, setData] = useState(cachedProducts || []);
  const [loading, setLoading] = useState(!cachedProducts);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (cachedProducts) return; // Already loaded → skip fetch

    let isMounted = true;
    fetch("/products.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then((json) => {
        cachedProducts = json; // Save globally for next calls
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (isMounted) {
          setErr(e);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, err };
}
