import { Menu } from "lucide-react";

interface NavbarProps {
  toggleSidebar?: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  return (
    <nav className="bg-white shadow px-4 py-3 flex items-center justify-between">
      {/* Left: Mobile Hamburger */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded hover:bg-gray-100"
      >
        <Menu size={22} />
      </button>

      {/* Center: App Name */}
      <h1 className="text-lg font-bold text-blue-600">Election Hub</h1>

      {/* Right: Placeholder for Profile */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Welcome</span>
      </div>
    </nav>
  );
};

export default Navbar;
