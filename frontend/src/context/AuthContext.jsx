import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

// Create the context
const AuthContext = createContext(null);

// Define roles
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

        // Load user from local storage (for testing purposes)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        // If not using test user, fetch real user data from API
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

  // Function for logging in
  const login = async (credentials) => {
    // Hardcoded test users for quick testing
    const testUsers = [
      { email: "admin@test.com", password: "admin123", role: ROLES.ADMIN },
      { email: "cashier@test.com", password: "cashier123", role: ROLES.CASHIER },
      { email: "teacher@test.com", password: "teacher123", role: ROLES.TEACHER },
      { email: "student@test.com", password: "student123", role: ROLES.STUDENT_PARENT },
      { email: "parent@test.com", password: "parent123", role: ROLES.STUDENT_PARENT },
    ];

    const testUser = testUsers.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (testUser) {
      // Simulate token
      localStorage.setItem("token", "test-token-12345");
      localStorage.setItem("user", JSON.stringify(testUser));
      setUser(testUser);
      return;
    }

    // If not a test user, try real API authentication
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw new Error("Invalid email or password");
    }
  };

  // Function for logging out
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

export { AuthProvider, AuthContext, useAuth, ROLES };