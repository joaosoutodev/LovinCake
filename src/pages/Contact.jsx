// src/pages/Contact.jsx
// Contact page:
// - Simple controlled form (name, email, message)
// - Simulates a submit request and shows toast/alert feedback

import { useState } from "react";
import { useToast } from "../context/ToastContext";

export default function Contact() {
  const toast = useToast?.();
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  // Update form values
  function handleChange(e) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  // Simulate submit and notify the user
  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      if (toast?.success) toast.success("Message sent! We will contact you soon.");
      else alert("Message sent! We will contact you soon.");
      setValues({ name: "", email: "", message: "" });
    } catch (err) {
      if (toast?.error) toast.error("Failed to send message.");
      else alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-xxl py-5" style={{ maxWidth: 700 }}>
      <h1 className="h3 mb-3">Contact Us</h1>
      <p className="text-muted mb-4">
        Have a question or a special cake request? Send us a message!
      </p>

      <form onSubmit={handleSubmit} className="vstack gap-3">
        <div>
          <label className="form-label">Name</label>
          <input
            className="form-control"
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label className="form-label">Email</label>
          <input
            className="form-control"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="form-label">Message</label>
          <textarea
            className="form-control"
            name="message"
            rows={4}
            value={values.message}
            onChange={handleChange}
            required
          />
        </div>

        <button className="btn btn-primary" disabled={sending}>
          {sending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
