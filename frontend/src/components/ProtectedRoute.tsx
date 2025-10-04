import { Navigate, Outlet } from "react-router-dom";

// Replace this with your actual auth logic
const useAuth = () => {
  // Check if user is authenticated
  // This could check localStorage, context, or a state management solution
  const token = localStorage.getItem("authToken");
  return !!token; // Returns true if authenticated
};

export default function ProtectedRoute() {
  const isAuthenticated = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}
