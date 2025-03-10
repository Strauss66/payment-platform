import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

// Create the context
const AuthContext = createContext(null);

// Define roles for easy reference
const ROLES = {
  ADMIN: "admin",
  CASHIER: "cashier",
  TEACHER: "teacher",
  STUDENT_PARENT: "student_parent",
};

// Provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getUserInfo();
  }, []);

  const login = async (credentials) => {
    const response = await axios.post("/api/auth/login", credentials);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
const useAuth = () => useContext(AuthContext);

// ✅ Export properly
export { AuthProvider, AuthContext, useAuth, ROLES };