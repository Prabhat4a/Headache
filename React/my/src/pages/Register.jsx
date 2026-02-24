import React from "react";
import AuthContainer from "../components/auth/AuthContainer";
import "../styles/auth.css"; // This is correct for src/pages/ to src/styles/

const Register = () => {
  return <AuthContainer initialView="register" />;
};

export default Register;
