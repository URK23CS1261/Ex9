import { useEffect, useState } from "react";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_BACKEND_API;

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/properties`);
        if (Array.isArray(res.data)) {
          setProperties(res.data);
        } else if (res.data && Array.isArray(res.data.properties)) {
          setProperties(res.data.properties);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return <div className="text-muted">Loading properties...</div>;

  return (
    <div>
      <h3 className="mb-4 fw-bold text-primary">Available Properties</h3>
      <div className="row">
        {Array.isArray(properties) && properties.length > 0 ? (
          properties.map((p) => (
            <div className="col-md-4 mb-4" key={p._id || p.id}>
              <div className="card shadow-sm">
                <img
                  src={p.image || "https://via.placeholder.com/400x250"}
                  className="card-img-top"
                  alt={p.title || "Property"}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.title || "Untitled Property"}</h5>
                  <p className="text-muted">{p.location || "Unknown location"}</p>
                  <p className="fw-bold text-success">
                    ₹{p.price ? p.price.toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted">No properties available.</div>
        )}
      </div>
    </div>
  );
}
