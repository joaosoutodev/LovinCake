// src/context/CartContext.jsx
import { createContext, useContext, useMemo, useReducer } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "init":
      // substitui o carrinho inteiro
      return Array.isArray(action.payload)
        ? action.payload.map((x) => ({
            id: Number(x.id),
            qty: Number(x.qty) || 1,
          }))
        : [];

    case "add": {
      const { id, qty } = action.payload;
      const i = state.findIndex((x) => x.id === id);
      if (i >= 0) {
        const copy = [...state];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...state, { id, qty }];
    }

    case "inc":
      return state.map((x) =>
        x.id === action.payload ? { ...x, qty: x.qty + 1 } : x,
      );

    case "dec":
      return state.flatMap((x) =>
        x.id === action.payload
          ? x.qty > 1
            ? [{ ...x, qty: x.qty - 1 }]
            : []
          : [x],
      );

    case "remove":
      return state.filter((x) => x.id !== action.payload);

    case "clear":
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [persisted, setPersisted] = useLocalStorage("cart", []);

  const initial = Array.isArray(persisted)
    ? persisted.map((x) => ({ id: Number(x.id), qty: Number(x.qty) || 1 }))
    : [];

  const [state, dispatchBase] = useReducer(reducer, initial);

  const dispatch = (action) => {
    let a = action;
    if (a.type === "add") {
      a = {
        ...a,
        payload: { id: Number(a.payload.id), qty: Number(a.payload.qty) || 1 },
      };
    }
    if (["inc", "dec", "remove"].includes(a.type)) {
      a = { ...a, payload: Number(a.payload) };
    }

    const next = reducer(state, a);
    setPersisted(next); // <- garante persistência
    return dispatchBase(a);
  };

  const replaceAll = (next = []) => {
    const normalized = Array.isArray(next)
      ? next.map((x) => ({ id: Number(x.id), qty: Number(x.qty) || 1 }))
      : [];
    setPersisted(normalized); // <- persiste
    dispatchBase({ type: "init", payload: normalized });
  };

  const count = useMemo(() => state.reduce((a, b) => a + b.qty, 0), [state]);

  const api = {
    lines: state, // [{id, qty}]
    count,
    addItem: (id, qty = 1) => dispatch({ type: "add", payload: { id, qty } }),
    inc: (id) => dispatch({ type: "inc", payload: id }),
    dec: (id) => dispatch({ type: "dec", payload: id }),
    remove: (id) => dispatch({ type: "remove", payload: id }),
    clear: () => dispatch({ type: "clear" }),
    replaceAll, // versão que também persiste
  };

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
