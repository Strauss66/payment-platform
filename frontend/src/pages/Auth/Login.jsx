import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import { MDBBtn, MDBContainer, MDBCard, MDBCardBody, MDBCardImage, MDBRow, MDBCol, MDBInput, MDBCheckbox } from "mdb-react-ui-kit";

function Login() {
  return (
    <MDBContainer className="my-5 d-flex justify-content-center">
      <MDBCard className="shadow-lg" style={{ maxWidth: "800px" }}>
        <MDBRow className="g-0 d-flex align-items-center">
          {/* Left Side Image */}
          <MDBCol md="6">
            <MDBCardImage
              src="https://mdbootstrap.com/img/new/ecommerce/vertical/004.jpg"
              alt="phone"
              className="w-100 rounded-start"
            />
          </MDBCol>

          {/* Right Side Form */}
          <MDBCol md="6">
            <MDBCardBody className="p-4">
              <h3 className="text-center mb-4">Sign In</h3>

              <MDBInput className="mb-3" label="Email address" id="form1" type="email" />
              <MDBInput className="mb-3" label="Password" id="form2" type="password" />

              <div className="d-flex justify-content-between mb-3">
                <MDBCheckbox name="flexCheck" id="flexCheckDefault" label="Remember me" />
                <a href="#" className="text-primary">Forgot password?</a>
              </div>

              <MDBBtn className="w-100">Sign in</MDBBtn>
            </MDBCardBody>
          </MDBCol>
        </MDBRow>
      </MDBCard>
    </MDBContainer>
  );
}

export default Login;