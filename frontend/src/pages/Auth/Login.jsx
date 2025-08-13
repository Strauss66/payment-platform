import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);

      // Redirect based on first matched role
      const roleRedirects = {
        admin: "/admin/dashboard",
        cashier: "/cashier/dashboard",
        teacher: "/teacher/dashboard",
        student_parent: "/portal/dashboard",
      };
      const rolePriority = ["admin", "cashier", "teacher", "student_parent"];
      const roles = Array.isArray(user?.roles) ? user.roles : [];
      const primaryRole = rolePriority.find((r) => roles.includes(r));
      navigate(roleRedirects[primaryRole] || "/login");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        <p className="text-sm text-gray-600 mt-1">Welcome back to your account</p>
      </div>

      {error && (
        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        <a
          href="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Sign In
      </button>

      <div className="text-center">
        <span className="text-sm text-gray-600">Don't have an account? </span>
        <a
          href="/auth/register"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign up
        </a>
      </div>
    </form>
  );
}