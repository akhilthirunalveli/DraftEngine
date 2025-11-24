import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SyncLoader } from "react-spinners";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="p-4">
        <SyncLoader />
      </div>
    );
  return user ? <Outlet /> : <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
};

export default ProtectedRoute;