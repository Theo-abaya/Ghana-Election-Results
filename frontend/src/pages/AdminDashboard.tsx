import {
  Users,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  Clock,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import { showToast } from "../utils/toast";
import { getCurrentUser, getDashboardStats } from "../services/api";
import {
  ManageUsersModal,
  ManagePartiesModal,
  ManageCandidatesModal,
  ExportDataModal,
  ViewAuditLogsModal,
  SystemSettingsModal,
  ManagePollingStationsModal, // ✅ NEW IMPORT
} from "../components/admin/AdminModals";

interface DashboardStats {
  totalUsers: number;
  pollingOfficers: number;
  resultsSubmitted: number;
  systemStatus: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pollingOfficers: 0,
    resultsSubmitted: 0,
    systemStatus: "Loading...",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>("");
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [user, dashboardStats] = await Promise.all([
        getCurrentUser(),
        getDashboardStats(),
      ]);

      setAdminName(user.email.split("@")[0]);
      setStats(dashboardStats);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      showToast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    showToast.success("Dashboard refreshed");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-xl shadow-md p-6 h-24"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md p-6 h-32"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unable to Load Dashboard
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Akwaaba, <span className="font-semibold">{adminName}</span>
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Registered system users</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Polling Officers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pollingOfficers}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Active polling officers</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Results Submitted</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.resultsSubmitted}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Total result entries</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">System Status</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.systemStatus}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">All services operational</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveModal("users")}
            className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <Users className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">Manage Users</p>
            <p className="text-sm text-gray-600">
              Add, edit, or remove system users
            </p>
          </button>

          <button
            onClick={() => setActiveModal("pollingStations")} // ✅ NEW BUTTON
            className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
          >
            <MapPin className="w-6 h-6 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">
              Manage Polling Stations
            </p>
            <p className="text-sm text-gray-600">
              Add, edit, or remove polling stations
            </p>
          </button>

          <button
            onClick={() => setActiveModal("export")}
            className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
          >
            <Download className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">Export Data</p>
            <p className="text-sm text-gray-600">
              Download results and reports
            </p>
          </button>

          <button
            onClick={() => setActiveModal("audit")}
            className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
          >
            <Clock className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">View Audit Logs</p>
            <p className="text-sm text-gray-600">System activity history</p>
          </button>

          <button
            onClick={() => setActiveModal("parties")}
            className="p-4 border-2 border-yellow-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left group"
          >
            <Shield className="w-6 h-6 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">Manage Parties</p>
            <p className="text-sm text-gray-600">Add, edit, or remove party</p>
          </button>

          <button
            onClick={() => setActiveModal("candidates")}
            className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
          >
            <Users className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">Manage Candidates</p>
            <p className="text-sm text-gray-600">
              Add, edit, or remove candidates
            </p>
          </button>

          <button
            onClick={() => setActiveModal("settings")}
            className="p-4 border-2 border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left group"
          >
            <Settings className="w-6 h-6 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-gray-900">System Settings</p>
            <p className="text-sm text-gray-600">Configure system parameters</p>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ManageUsersModal
        isOpen={activeModal === "users"}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchDashboardData}
      />
      <ManagePollingStationsModal // ✅ NEW MODAL
        isOpen={activeModal === "pollingStations"}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchDashboardData}
      />
      <ManagePartiesModal
        isOpen={activeModal === "parties"}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchDashboardData}
      />
      <ManageCandidatesModal
        isOpen={activeModal === "candidates"}
        onClose={() => setActiveModal(null)}
        onSuccess={fetchDashboardData}
      />
      <ExportDataModal
        isOpen={activeModal === "export"}
        onClose={() => setActiveModal(null)}
      />
      <ViewAuditLogsModal
        isOpen={activeModal === "audit"}
        onClose={() => setActiveModal(null)}
      />
      <SystemSettingsModal
        isOpen={activeModal === "settings"}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
