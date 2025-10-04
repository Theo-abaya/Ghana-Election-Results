import { Menu, Home, Info, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../assets/Election_hub.png";

interface NavbarProps {
  toggleSidebar?: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Mobile Hamburger */}
          <div className="flex items-center gap-4">
            {toggleSidebar && (
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logoImage}
                alt="Election Hub Logo"
                className="h-12 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Election Hub
                </h1>
                <p className="text-xs text-gray-500 italic">
                  Democracy meets precision
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              <Home size={18} />
              Home
            </Link>
            <Link
              to="/results/presidential"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Results
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              <Info size={18} />
              About
            </Link>
          </div>

          {/* Right: Login Button */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
