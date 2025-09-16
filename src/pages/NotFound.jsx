// src/pages/NotFound.jsx
// Simple fallback for unmatched routes (404 page)

export default function NotFound() {
  return (
    <div className="container-xxl py-5 text-center">
      <h1 className="display-5 fw-bold">404</h1>
      <p className="text-muted mb-4">Page not found.</p>
      <a href="/" className="btn btn-primary">
        Go back home
      </a>
    </div>
  );
}
