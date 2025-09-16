// src/pages/Privacy.jsx
// Simple static Privacy Policy page

export default function Privacy() {
  return (
    <div className="container-xxl py-5" style={{ maxWidth: 800 }}>
      <h1 className="h3 mb-3">Privacy Policy</h1>

      <p className="text-muted">
        Lovin'Cake is a demo project. No real user data is stored permanently.
      </p>

      <p className="text-muted">
        Any personal data entered (email, name, orders) is only used for testing
        the app and may be deleted at any time. This project does not sell or
        share data with third parties.
      </p>

      <p className="text-muted">
        By using this website, you agree that this is a fictional service and no
        real transactions will be processed.
      </p>
    </div>
  );
}
