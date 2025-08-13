import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext, ROLES } from "../../contexts/AuthContext";

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="font-bold text-lg">School Payments</Link>
        <div>
          {user ? (
            <>
              {user.role === ROLES.ADMIN && <Link to="/admin/dashboard" className="mr-4">Admin</Link>}
              {user.role === ROLES.CASHIER && <Link to="/cashier/dashboard" className="mr-4">Cashier</Link>}
              {user.role === ROLES.TEACHER && <Link to="/teacher/dashboard" className="mr-4">Teacher</Link>}
              {user.role === ROLES.STUDENT_PARENT && <Link to="/portal/dashboard" className="mr-4">Portal</Link>}
              <button onClick={logout} className="ml-4">Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
