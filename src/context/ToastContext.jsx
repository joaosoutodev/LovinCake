import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, timeout = 2200) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, timeout);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Host fixed no canto inferior direito */}
      <div
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1080 }}
        className="d-flex flex-column gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast show align-items-center text-bg-dark border-0"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{ minWidth: 260 }}
          >
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
