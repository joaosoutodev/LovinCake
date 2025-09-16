import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer mt-5 border-top">
      <div className="container py-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        {/* Left side - copyright */}
        <div className="small text-muted">
          © {new Date().getFullYear()} Lovin'Cake by João Souto
        </div>

        {/* Right side - nav links */}
        <div className="d-flex gap-3 small">
          {/* Usa Link para navegação interna */}
          <Link to="/about" className="text-decoration-none">
            About
          </Link>
          <Link to="/contact" className="text-decoration-none">
            Contact
          </Link>
          <Link to="/privacy" className="text-decoration-none">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
