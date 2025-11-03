import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_API;


export default function Verify() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const email = params.get('email');
  const [msg, setMsg] = useState('Verifying...');
  useEffect(() => {
    if (!token || !email) { setMsg('Invalid verification link'); return; }
    axios.get(`${API_BASE_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`)
      .then(res => setMsg(res.data.message || 'Verified!'))
      .catch(err => setMsg(err.response?.data?.message || 'Verification failed'));
  }, []);
  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}>
      <div className="card p-4"><h5>{msg}</h5><div className="mt-3"><Link to="/login">Go to Login</Link></div></div>
    </div>
  );
}
