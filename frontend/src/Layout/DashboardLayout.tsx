import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 bg-gray-50 p-4">
          <Outlet />
        </main>
        <footer className="bg-white shadow-inner text-center py-4 text-gray-500 text-sm">
          © {new Date().getFullYear()} Election Hub. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
