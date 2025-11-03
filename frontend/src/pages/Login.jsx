import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const {login} = useAuth()
  const navigate = useNavigate();
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form)
      if(res?.data?.message == "Login successful") navigate("/dashboard");
    } catch (err) {
      console.log(err)
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "75vh" }}
    >
      <div className="card p-4 shadow-sm" style={{ width: 400 }}>
        <h4 className="mb-3 text-center">Login</h4>
        {message && <div className="alert alert-danger">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <input
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              className="form-control"
              placeholder="Username or email"
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
          <button className="btn btn-primary w-100">Login</button>
        </form>
        <div className="mt-3 text-center">
          <Link to="/register">Register</Link> ·{" "}
          <Link to="/forgot">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
