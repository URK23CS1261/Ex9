import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_BACKEND_API;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true, 
        });
        setUser(userData.data.user);
      } catch (error) {
        console.error("Auto login failed:", error.message);
        setUser(null);
      } finally {
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const userData = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
      withCredentials: true,
    });
    setUser(userData.data.user);
    return userData;
  };

  const logout = async () => {
    await axios.post(`${API_BASE_URL}/auth/logout`, {
      withCredentials: true,
    });
    setUser(null);
  };

  const register = async (credentials) => {
    const userData = await axios.post(`${API_BASE_URL}/auth/register`, credentials, {
      withCredentials: true,
    });
    setUser(userData.data.user);
    return userData;
  };
  
  const reset = async (credentials) => {
    const userData = await axios.post(`${API_BASE_URL}/auth/reset`, credentials, {
      withCredentials: true,
    });
    setUser(userData.data.user);
    return userData;
  };

  const forget = async (credentials) => {
    const userData = await axios.post(`${API_BASE_URL}/auth/forget`, credentials, {
      withCredentials: true,
    });
    setUser(userData.data.user);
    return userData;
  };
  
  const value = {
    user,
    login,
    logout,
    register,
    reset,
    forget
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
