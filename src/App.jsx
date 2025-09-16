// App.jsx
// - Router and Providers.
// - Header with a headless (React-controlled) dropdown.
// - Closes on outside click, Esc, route change, and item click.

import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import CakeRequests from "./pages/CakeRequests";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";

import { CartProvider, useCart } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

/* -----------------------------
   Header (headless dropdown)
   ----------------------------- */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { count, replaceAll } = useCart();
  const { user, logout, profile, login } = useAuth();

  const isAuthed = !!user;
  const isDemo =
    profile?.role?.toLowerCase?.() === "demo" ||
    (!!import.meta.env.VITE_DEMO_EMAIL &&
      user?.email === import.meta.env.VITE_DEMO_EMAIL);

  const firstName =
    profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  // Headless dropdown state/refs
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 576px)").matches
      : false
  );

  // Track viewport to switch to fixed dropdown on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 576px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener?.("change", handler);
    mq.addListener?.(handler);
    return () => {
      mq.removeEventListener?.("change", handler);
      mq.removeListener?.(handler);
    };
  }, []);

  const toggleMenu = () => setOpen((v) => !v);
  const closeMenu = () => setOpen(false);

  // Close on outside click/touch
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      const t = e.target;
      if (!btnRef.current || !menuRef.current) return;
      if (!btnRef.current.contains(t) && !menuRef.current.contains(t)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, [open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Close on route change
  useEffect(() => setOpen(false), [location.pathname]);

  // Lightweight flash toast (fallback if no toast system)
  const [flash, setFlash] = useState(null); // { type: 'success' | 'error', text: string }
  function showFlash(type, text, ms = 3000) {
    setFlash({ type, text });
    window.clearTimeout(showFlash._t);
    showFlash._t = window.setTimeout(() => setFlash(null), ms);
  }

  // Show flash when auth state changes
  const prevAuthed = useRef(isAuthed);
  useEffect(() => {
    if (prevAuthed.current !== isAuthed) {
      if (isAuthed) {
        const name =
          profile?.full_name?.split(" ")[0] ||
          user?.email?.split("@")[0] ||
          "user";
        const msg = `You are logged in as ${name}.`;
        showFlash("success", msg);
      } else {
        const msg = "You have been logged out.";
        showFlash("success", msg);
      }
      prevAuthed.current = isAuthed;
    }
  }, [isAuthed, profile?.full_name, user?.email]);

  // Demo login using env credentials
  async function handleDemoLogin() {
    try {
      const email = import.meta.env.VITE_DEMO_EMAIL;
      const password =
        import.meta.env.VITE_DEMO_PASSWORD ?? import.meta.env.VITE_DEMO_PASS;
      if (!email || !password)
        throw new Error(
          "Demo not configured: set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD (or VITE_DEMO_PASS)."
        );
      await login(email, password);
      navigate("/");
    } catch (e) {
      console.error("Demo login failed:", e);
      const msg = e.message || "Failed to log into demo account.";
      showFlash("error", msg, 4000);
    }
  }

  // Logout and clear cart
  async function handleLogout() {
    try {
      await logout();
      replaceAll([]);
      navigate("/");
    } catch (e) {
      console.error("Logout failed:", e);
      const msg = e.message || "Failed to logout.";
      showFlash("error", msg, 4000);
    }
  }

  return (
    <header className="header border-bottom">
      {/* Flash toast (top-right) */}
      {flash && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 4000 }}
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className={
              "toast show text-white border-0 " +
              (flash.type === "error" ? "bg-danger" : "bg-success")
            }
            role="status"
          >
            <div className="toast-body">{flash.text}</div>
          </div>
        </div>
      )}

      <nav className="container d-flex align-items-center gap-3 py-2">
        {/* Logo */}
        <Link
          to="/"
          className="d-flex align-items-center gap-2 text-decoration-none"
        >
          <img
            src="/img/logo.png"
            alt="Lovin'Cake"
            style={{ height: 42, width: "auto" }}
          />
        </Link>

        {/* Right actions */}
        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Cart (Checkout is reached from Cart) */}
          <Link
            to="/cart"
            className="btn btn-soft-primary btn-cart position-relative"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h8.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Cart</span>
            {count > 0 && (
              <span className="badge badge-cart text-white">{count}</span>
            )}
          </Link>

          {/* User dropdown (headless + responsive) */}
          {isAuthed ? (
            <div className="dropdown" style={{ position: "relative" }}>
              <button
                ref={btnRef}
                id="userMenuToggle"
                className={
                  "btn btn-light d-flex align-items-center gap-2 dropdown-toggle" +
                  (open ? " show" : "")
                }
                type="button"
                aria-haspopup="true"
                aria-expanded={open ? "true" : "false"}
                onClick={toggleMenu}
              >
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center bg-secondary text-white"
                  style={{ width: 28, height: 28, fontSize: 12 }}
                >
                  {(firstName?.[0] || "U").toUpperCase()}
                </div>
                <span className="d-none d-sm-inline">Menu</span>
              </button>

              {/* Backdrop only on mobile */}
              {open && isMobile && (
                <div
                  className="dropdown-backdrop"
                  onClick={closeMenu}
                />
              )}

              <ul
                ref={menuRef}
                className={
                  "dropdown-menu dropdown-menu-end shadow-sm" +
                  (open ? " show" : "")
                }
                aria-labelledby="userMenuToggle"
                onClick={closeMenu}
                style={{ position: isMobile ? "fixed" : "absolute", zIndex: 3000 }}
              >
                <li>
                  <h6 className="dropdown-header mb-0">Hi, {firstName}!</h6>
                </li>
                <li>
                  <Link className="dropdown-item" to="/profile">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/cake-requests">
                    Cake Requests
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/orders">
                    Latest Orders
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                {!isDemo && (
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      Settings
                    </Link>
                  </li>
                )}
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button onClick={handleDemoLogin} className="btn btn-soft-info">
                Demo
              </button>
              <Link
                to="/login"
                className="btn btn-outline-secondary rounded-pill btn-sm"
              >
                Login
              </Link>
              <Link to="/signup" className="btn btn-danger rounded-pill btn-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

/* -----------------------------
   App (wraps Router + Providers)
   ----------------------------- */
export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Header />
            <main className="container-xxl py-5 px-3 px-xl-4">
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/product/:slug" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/success" element={<Success />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Private */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cake-requests"
                  element={
                    <ProtectedRoute>
                      <CakeRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Not found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
