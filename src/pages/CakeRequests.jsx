// src/pages/CakeRequests.jsx
// Cake Requests page:
// - Authenticated users can submit custom cake requests
// - Uses ToastContext if available; otherwise falls back to inline alerts
// - Resets the form on success

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createCakeRequest } from "../lib/cakeRequestsApi";
import { useToast } from "../context/ToastContext";

export default function CakeRequests() {
  const { user } = useAuth();
  const toast = useToast?.(); // Optional toast context

  const [values, setValues] = useState({
    title: "",
    description: "",
    servings: 8,
    due_date: "",
  });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [submitting, setSubmitting] = useState(false);

  // Update controlled fields
  const onChange = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  // Submit the request
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      await createCakeRequest({
        user_id: user.id,
        ...values,
        servings: Number(values.servings) || 1,
      });

      // Success feedback
      if (toast?.success) {
        toast.success("Your cake request has been submitted! 🎉");
      } else {
        setStatus({ type: "success", msg: "Your cake request has been submitted! 🎉" });
      }

      // Reset form
      setValues({ title: "", description: "", servings: 8, due_date: "" });
    } catch (err) {
      console.error(err);
      if (toast?.error) {
        toast.error(err.message || "Error submitting request.");
      } else {
        setStatus({ type: "error", msg: err.message || "Error submitting request." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1 className="mb-3">Submit Cake Requests</h1>
      <p className="text-muted mb-4">
        Here you can tell us what you want that is not in the menu! <br />
        We will reach out via email with the details. <br />
        Please note that highly personalized cakes can be expensive.
      </p>

      {/* Inline alert only when no toast system is present */}
      {!toast && status.msg && (
        <div
          className={`alert ${
            status.type === "success" ? "alert-success" : "alert-danger"
          }`}
        >
          {status.msg}
        </div>
      )}

      <form className="row g-3" onSubmit={onSubmit}>
        <div className="col-12">
          <label className="form-label">Title</label>
          <input
            name="title"
            className="form-control"
            value={values.title}
            onChange={onChange}
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control"
            rows={4}
            value={values.description}
            onChange={onChange}
          />
        </div>

        <div className="col-6 col-md-3">
          <label className="form-label">Servings</label>
          <input
            name="servings"
            type="number"
            min="1"
            className="form-control"
            value={values.servings}
            onChange={onChange}
          />
        </div>

        <div className="col-6 col-md-4">
          <label className="form-label">Due date</label>
          <input
            name="due_date"
            type="date"
            className="form-control"
            value={values.due_date}
            onChange={onChange}
          />
        </div>

        <div className="col-12">
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </form>
    </div>
  );
}
