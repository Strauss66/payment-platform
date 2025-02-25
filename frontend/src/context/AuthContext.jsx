import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Create the context
export const AuthContext = createContext();

// Define roles for easy reference
export const ROLES = {
  ADMIN: "admin",
  CASHIER: "cashier",
  TEACHER: "teacher",
  STUDENT_PARENT: "student_parent",
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // store user details
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch current user info on mount
    const getUserInfo = async () => {
      try {
        // Example: Checking for a saved token in local storage
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        // If token exists, fetch user
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
    // Example login method
    const response = await axios.post("/api/auth/login", credentials);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};