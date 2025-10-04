import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Graphic */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
          <div className="flex justify-center mb-6">
            <Search className="w-24 h-24 text-gray-300" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all border-2 border-blue-600"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">You might be interested in:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/dashboard/presidential"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Presidential Results
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/dashboard/parliamentary"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Parliamentary Data
            </Link>
            <span className="text-gray-400">•</span>
            <Link
              to="/dashboard/regions"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Regional Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
