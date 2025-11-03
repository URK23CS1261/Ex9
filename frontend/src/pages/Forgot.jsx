import { useState } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_API;

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot`, { email });
      setMsg(res.data.message || 'If that email exists, a reset link was sent.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };
  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}>
      <div className="card p-4" style={{width:400}}>
        <h5>Forgot Password</h5>
        {msg && <div className="alert alert-info">{msg}</div>}
        <form onSubmit={submit}>
          <input className="form-control mb-2" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <button className="btn btn-primary w-100">Send reset link</button>
        </form>
      </div>
    </div>
  );
}
