import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
const API_BASE_URL = import.meta.env.VITE_BACKEND_API;

export default function Register() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const {register} = useAuth()
  const navigate = useNavigate();
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const res = await register(form)
      console.log(res)
      alert(
        "Registration successful! Check your email to verify your account."
      );
      navigate("/login");
    } catch (err) {
      console.log(err);
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "75vh" }}
    >
      <div className="card p-4 shadow-sm" style={{ width: 480 }}>
        <h4 className="mb-3 text-center">Register</h4>
        {message && <div className="alert alert-danger">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="form-control"
              placeholder="Full name"
              required
            />
          </div>
          <div className="mb-2">
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className="form-control"
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-2">
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="form-control"
              placeholder="Username"
              required
            />
          </div>
          <div className="mb-2">
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              className="form-control"
              placeholder="Password"
              required
            />
          </div>
          <div className="mb-2">
            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              type="password"
              className="form-control"
              placeholder="Confirm password"
              required
            />
          </div>
          <button className="btn btn-success w-100">Register</button>
        </form>
        <div className="mt-3 text-center">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}
