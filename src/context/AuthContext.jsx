import { createContext, useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Check if user is already logged in (on page refresh)
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // In a real app, you might want to fetch the user profile here
      // For now, we assume if token exists, we are logged in.
    }
  }, [token]);

  // Login Function
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      
      // Save Token
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        msg: error.response?.data?.message || "Login failed" 
      };
    }
  };

  // Register Function
  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password,
      });

      // Save Token (Auto login after register)
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        msg: error.response?.data?.message || "Registration failed" 
      };
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;