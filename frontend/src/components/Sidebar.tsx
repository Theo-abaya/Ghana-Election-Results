import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  X,
  Vote,
  Users,
  Globe,
  Send,
  Shield,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import logoImage from "../assets/Election_hub.png";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "../services/api";
import { showToast } from "../utils/toast";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const user = await getCurrentUser();
      setUserEmail(user.email);
      setUserRole(user.role);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleLogout = () => {
    showToast.success("Logged out successfully");
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Submit Results",
      path: "/dashboard/submit",
      icon: <Send size={20} />,
      roles: ["ADMIN", "POLLING_OFFICER"],
    },
    {
      name: "Presidential",
      path: "/dashboard/presidential",
      icon: <Vote size={20} />,
      roles: ["ADMIN", "POLLING_OFFICER"],
    },
    {
      name: "Parliamentary",
      path: "/dashboard/parliamentary",
      icon: <Users size={20} />,
      roles: ["ADMIN", "POLLING_OFFICER"],
    },
    {
      name: "Regions",
      path: "/dashboard/regions",
      icon: <Globe size={20} />,
      roles: ["ADMIN", "POLLING_OFFICER"],
    },
    {
      name: "Admin Panel",
      path: "/dashboard/admin",
      icon: <Shield size={20} />,
      roles: ["ADMIN"],
      adminOnly: true,
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="Election Hub Logo"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Election Hub
                </h1>
                <p className="text-xs text-gray-500 italic">
                  Democracy & precision
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            Navigation
          </div>
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className={isActive ? "text-white" : "text-gray-500"}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                    {userEmail}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole.replace("_", " ")}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                <Link
                  to="/dashboard/profile"
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <User size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Profile Settings
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                >
                  <LogOut size={18} className="text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    Log Out
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
