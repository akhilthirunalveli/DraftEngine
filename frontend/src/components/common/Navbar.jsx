import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const n = useNavigate();

  const handleLogout = () => {
    logout();
    n("/login");
  };

  return (
    <nav className="text-black p-4 flex justify-between items-center ">
      <Link to="/" className="text-3xl font-bold text-black tracking-tight" style={{ fontFamily: "'MuseoModerno', sans-serif" }}>DraftEngine.</Link>
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link to="/dashboard" className="button-74-navbar" role="button">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="button-74-navbar" role="button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="button-74-navbar" role="button">
              Login
            </Link>
            <Link to="/register" className="button-74-navbar" role="button">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;