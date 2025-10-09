import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";

export default function DashboardRedirect() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const determineDashboard = async () => {
      try {
        const user = await getCurrentUser();
        setUserRole(user.role);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // If there's an error, redirect to submit page as fallback
        setUserRole("POLLING_OFFICER");
      } finally {
        setIsLoading(false);
      }
    };

    determineDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect based on user role
  if (userRole === "ADMIN") {
    return <Navigate to="/dashboard/admin" replace />;
  } else {
    // Default to polling officer dashboard
    return <Navigate to="/dashboard/submit" replace />;
  }
}
