// src/pages/About.jsx
// About page with project description, features, contact info, map, and JSON-LD for SEO.

import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="container-xxl py-5">
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-6">
          <h1 className="h3 mb-2">About Lovin'Cake</h1>
          <p className="text-muted mb-4">
            Lovin'Cake is a fictional online bakery project focused on custom cakes
            and made-to-order requests. It started as a technical challenge to test UX,
            authentication, cart, and checkout — and evolved into an “almost real” shop.
          </p>

          <h2 className="h5 mb-2">How it started</h2>
          <ul className="list-unstyled small text-muted mb-4">
            <li>• 2023 — front-end prototype (catalog and cart)</li>
            <li>• 2024 — authentication + custom cake requests</li>
            <li>• 2025 — checkout with Supabase Functions and reCAPTCHA</li>
          </ul>

          <h2 className="h5 mb-2">What we do</h2>
          <ul className="small text-muted mb-4">
            <li>• Made-to-order cakes with customization options</li>
            <li>• Quick orders via shop and special orders via form</li>
            <li>• Local delivery (demo) and in-store pickup (fictional)</li>
          </ul>

          <div className="border rounded p-3 bg-white mb-4">
            <h3 className="h6 mb-2">Contact (demo)</h3>
            <div className="small">
              <div><strong>Email:</strong> hello@lovincake.demo</div>
              <div><strong>Phone:</strong> +31 30 123 4567</div>
              <div><strong>Opening hours:</strong> Mon–Sat 09:00–18:00</div>
            </div>
          </div>

          <Link to="/cake-requests" className="btn btn-primary">
            Request a custom cake
          </Link>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h6 mb-2">Location (fictional)</h2>
              <p className="small text-muted mb-3">
                Kanaalstraat 123, 3531 RK Utrecht, Netherlands (demo)
              </p>
              {/* Google Maps embed without API key: random coordinates in Utrecht */}
              <div className="ratio ratio-4x3 rounded overflow-hidden">
                <iframe
                  title="Lovin'Cake location (demo)"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=52.0911,5.1039&z=14&output=embed"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
              <p className="text-muted small mt-3 mb-0">
                Note: this location is for demo purposes only. It is not a real shop.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Bakery",
            name: "Lovin'Cake (Demo)",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Kanaalstraat 123",
              addressLocality: "Utrecht",
              postalCode: "3531 RK",
              addressCountry: "NL",
            },
            telephone: "+31 30 123 4567",
            email: "hello@lovincake.demo",
            url: "https://lovincake.demo",
            servesCuisine: "Dessert",
            priceRange: "€€",
            geo: { "@type": "GeoCoordinates", latitude: 52.0911, longitude: 5.1039 },
          }),
        }}
      />
    </div>
  );
}
