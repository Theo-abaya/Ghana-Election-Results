import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 p-4">
        <Outlet />
      </main>
      <footer className="bg-white shadow-inner text-center py-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} Election Hub. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Layout;
