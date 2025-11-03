import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
const API_BASE_URL = import.meta.env.VITE_BACKEND_API;

export default function Reset() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const {reset} = useAuth()
  const email = params.get('email');
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { setMsg('Passwords do not match'); return; }
    try {
      const res = await reset({ email, token, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
      console.log(res)
      setMsg(res.data.message || 'Password reset');
      setTimeout(()=>navigate('/login'),1000);
    } catch (err) {
      console.log(err)
      setMsg(err.response?.data?.message || 'Error resetting password');
    }
  };
  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}>
      <div className="card p-4" style={{width:420}}>
        <h5>Reset Password</h5>
        {msg && <div className="alert alert-info">{msg}</div>}
        <form onSubmit={submit}>
          <input className="form-control mb-2" placeholder="New password" type="password" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})} required/>
          <input className="form-control mb-2" placeholder="Confirm password" type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} required/>
          <button className="btn btn-success w-100">Reset password</button>
        </form>
        <div className="mt-3"><Link to="/login">Back to login</Link></div>
      </div>
    </div>
  );
}
