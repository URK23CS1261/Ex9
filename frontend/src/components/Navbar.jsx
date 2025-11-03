import { Link, useNavigate } from 'react-router-dom';
export default function Navbar() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/dashboard">🏠 RealEstate</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/forgot">Forgot Password</Link></li>
            <li className="nav-item"><button className="btn btn-outline-light btn-sm" onClick={logout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
