import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import logoImage from "../assets/Election_hub.png";
import { login } from "../services/api";
import { showToast } from "../utils/toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(email, password);
      console.log("Login successful:", response);

      showToast.success(`Welcome back, ${response.user.email}!`);

      if (response.user.role === "ADMIN") {
        navigate("/dashboard/admin");
      } else if (response.user.role === "POLLING_OFFICER") {
        navigate("/dashboard/submit");
      } else {
        navigate("/dashboard/submit");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Invalid email or password. Please try again.";

      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showToast.info(
      "Password reset feature coming soon! Contact support for assistance."
    );
  };

  const handleDemoLogin = (role: "admin" | "officer") => {
    if (role === "admin") {
      setEmail("admin@electionhub.com");
      setPassword("Admin@123");
    } else {
      setEmail("officer@electionhub.com");
      setPassword("Officer@123");
    }
    showToast.info(`Demo credentials loaded for ${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="hidden md:block">
            <div className="text-center space-y-6">
              <img
                src={logoImage}
                alt="Election Hub Logo"
                className="h-32 w-auto mx-auto"
              />
              <h1 className="text-4xl font-bold text-gray-900">Election Hub</h1>
              <p className="text-xl text-gray-600">
                Where Democracy Meets Precision
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-left bg-white p-4 rounded-lg shadow-sm">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Real-Time Results
                    </p>
                    <p className="text-sm text-gray-600">
                      Live election data as it happens
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left bg-white p-4 rounded-lg shadow-sm">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Transparent & Accurate
                    </p>
                    <p className="text-sm text-gray-600">
                      Verified data from official sources
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left bg-white p-4 rounded-lg shadow-sm">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Comprehensive Analysis
                    </p>
                    <p className="text-sm text-gray-600">
                      Presidential, Parliamentary & Regional data
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-8">
              <img
                src={logoImage}
                alt="Election Hub Logo"
                className="h-24 w-auto mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mt-2">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
              <p className="text-gray-600 mt-2">
                Access your election dashboard
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Demo Credentials Banner */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Demo Accounts:
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleDemoLogin("admin")}
                    className="w-full text-left text-xs text-blue-700 hover:text-blue-900 bg-white px-3 py-2 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    <span className="font-semibold">Admin:</span>{" "}
                    admin@electionhub.com / Admin@123
                  </button>
                  <button
                    onClick={() => handleDemoLogin("officer")}
                    className="w-full text-left text-xs text-blue-700 hover:text-blue-900 bg-white px-3 py-2 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    <span className="font-semibold">Officer:</span>{" "}
                    officer@electionhub.com / Officer@123
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Login Failed</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Don't need an account?
                  </span>
                </div>
              </div>

              {/* Public Access Link */}
              <div className="text-center">
                <Link
                  to="/results/presidential"
                  className="inline-flex items-center justify-center w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  View Public Results
                </Link>
              </div>
            </div>

            {/* Help Text */}
            <p className="text-center mt-6 text-sm text-gray-600">
              Need help? Contact{" "}
              <a
                href="mailto:support@electionhub.com"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                support@electionhub.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
