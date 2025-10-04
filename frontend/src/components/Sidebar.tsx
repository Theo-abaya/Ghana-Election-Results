import { Link, useLocation } from "react-router-dom";
import { X, Vote, Users, Globe, Send, Shield } from "lucide-react";
import logoImage from "../assets/Election_hub.png";
import { useState, useEffect } from "react";
import { getCurrentUser } from "../services/api";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const user = await getCurrentUser();
      setIsAdmin(user.role === "ADMIN");
    } catch (error) {
      console.error("Error checking user role:", error);
    }
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
        className={`fixed md:static z-40 top-0 left-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
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
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            Navigation
          </div>
          {navItems.map((item) => {
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <p className="font-semibold text-gray-700 mb-1">Need Help?</p>
            <a href="#" className="text-blue-600 hover:underline">
              Contact Support
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
