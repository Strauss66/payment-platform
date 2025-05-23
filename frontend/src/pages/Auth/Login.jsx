import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import { MDBBtn, MDBContainer, MDBCard, MDBCardBody, MDBCardImage, MDBRow, MDBCol, MDBInput, MDBCheckbox } from "mdb-react-ui-kit";

function Login() {
  const { login } = useContext(AuthContext); // Use login function from context
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Trying to login with:", credentials); // Debug log
  
    try {
      await login(credentials);
  
      // Get the user from localStorage (since login updates localStorage)
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        throw new Error("User data not found after login.");
      }
  
      console.log("Login successful, user data:", storedUser); // Debug log
  
      // Redirect based on role
      const roleRedirects = {
        admin: "/admin/dashboard",
        cashier: "/cashier/dashboard",
        teacher: "/teacher/dashboard",
        student_parent: "/portal/dashboard",
      };
  
      navigate(roleRedirects[storedUser.role] || "/login");
  
    } catch (err) {
      console.error("Login error:", err.message);
      setError("Invalid email or password");
    }
  };

  return (
    <MDBContainer className="my-5 d-flex justify-content-center">
      <MDBCard className="shadow-lg" style={{ maxWidth: "800px" }}>
        <MDBRow className="g-0 d-flex align-items-center">
          <MDBCol md="6">
            <MDBCardImage
              src="https://mdbootstrap.com/img/new/ecommerce/vertical/004.jpg"
              alt="phone"
              className="w-100 rounded-start"
            />
          </MDBCol>

          <MDBCol md="6">
            <MDBCardBody className="p-4">
              <h3 className="text-center mb-4">Sign In</h3>

              {error && <p className="text-danger text-center">{error}</p>}

              <form onSubmit={handleSubmit}>
                <MDBInput
                  className="mb-3"
                  label="Email address"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  required
                />
                <MDBInput
                  className="mb-3"
                  label="Password"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  required
                />

                <div className="d-flex justify-content-between mb-3">
                  <MDBCheckbox name="flexCheck" id="flexCheckDefault" label="Remember me" />
                  <a href="../ForgotPassword" className="text-primary">Forgot password?</a>
                </div>

                <MDBBtn type="submit" className="w-100">Sign in</MDBBtn>
              </form>
            </MDBCardBody>
          </MDBCol>
        </MDBRow>
      </MDBCard>
    </MDBContainer>
  );
}

export default Login;