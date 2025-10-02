import { Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import DashboardLayout from "./Layout/DashboardLayout";

// Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import PresidentialPage from "./pages/PresidentialPage";
import ParliamentaryPage from "./pages/ParliamentaryPage";
import RegionsPage from "./pages/RegionsPage";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Dashboard */}
      <Route element={<DashboardLayout />}>
        <Route path="/presidential" element={<PresidentialPage />} />
        <Route path="/parliamentary" element={<ParliamentaryPage />} />
        <Route path="/regions" element={<RegionsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
