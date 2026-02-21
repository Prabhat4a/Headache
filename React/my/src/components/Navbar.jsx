import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <h1>STUVO5</h1>
      </div>

      <div className="nav-links">
        <button className="login-btn" onClick={handleLoginClick}>
          Login
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
