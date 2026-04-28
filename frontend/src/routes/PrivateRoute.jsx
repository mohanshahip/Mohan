// routes/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const PrivateRoute = ({ children, requiredRole = "admin" }) => {
  const { isAuthenticated, user, loading, initialized } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being checked
  if (loading || !initialized) {
    return <LoadingSpinner text="Loading..." />;
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Deactivated account → redirect with message
  if (user?.isActive === false) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: "Your account has been deactivated. Please contact an administrator.",
        }}
        replace
      />
    );
  }

  // Role-based access control
  const userRole = user?.role;
  
  // Superadmin-only route
  if (requiredRole === "superadmin" && userRole !== "superadmin") {
    // Redirect to admin dashboard with message (could show toast via state)
    return <Navigate to="/admin" state={{ 
      error: "You don't have permission to access this page" 
    }} replace />;
  }

  // Admin routes - accessible by admin and superadmin
  if (requiredRole === "admin" && !["admin", "superadmin"].includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Access granted
  return children;
};

export default PrivateRoute;