import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { Vote, Users, Globe } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    { name: "Presidential", path: "/presidential", icon: <Vote size={18} /> },
    {
      name: "Parliamentary",
      path: "/parliamentary",
      icon: <Users size={18} />,
    },
    { name: "Regions", path: "/regions", icon: <Globe size={18} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header with Close on Mobile */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-600">Election Hub</h1>
            <p className="text-xs text-gray-500 italic">
              Where democracy meets precision
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // auto-close on mobile
                className={`flex items-center gap-2 p-2 rounded-md transition ${
                  isActive
                    ? "bg-blue-100 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
