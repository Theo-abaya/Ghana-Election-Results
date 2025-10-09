import { useState, useEffect } from "react";
import { X, Users, Shield, Download, Settings, Clock } from "lucide-react";
import {
  register,
  createParty,
  exportData,
  getAuditLogs,
  getAllParties,
  getSystemSettings,
  updateSystemSettings,
  getAllCandidatesAdmin,
  createCandidateAdmin,
  updateCandidateAdmin,
  deleteCandidateAdmin,
  updateParty,
  deleteParty,
  getAllConstituencies,
  getAllUsers,
  deleteUser,
  updateUser,
  getAllPollingStations,
  createPollingStation,
  updatePollingStation,
  deletePollingStation,
} from "../../services/api";
import { showToast } from "../../utils/toast";

// ============= MANAGE USERS MODAL =============
interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManageUsersModal({
  isOpen,
  onClose,
  onSuccess,
}: ManageUsersModalProps) {
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "POLLING_OFFICER",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      showToast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setView("add");
    setFormData({
      email: "",
      role: "POLLING_OFFICER",
      password: "",
      confirmPassword: "",
    });
    setError("");
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      password: "",
      confirmPassword: "",
    });
    setView("edit");
    setError("");
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user: ${email}?`)) return;

    try {
      await deleteUser(id);
      showToast.success("User deleted successfully!");
      fetchUsers();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (view === "add") {
      // Validation for add user
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }
    }

    try {
      setLoading(true);
      if (view === "add") {
        await register(formData.email, formData.password, formData.role);
        showToast.success("User created successfully!");
      } else {
        // Update user - only send email and role, not password
        await updateUser(editingUser.id, {
          email: formData.email,
          role: formData.role,
        });
        showToast.success("User updated successfully!");
      }
      setView("list");
      fetchUsers();
      onSuccess?.();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (view === "add" ? "Failed to create user" : "Failed to update user");
      setError(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {view === "list"
                  ? "Manage Users"
                  : view === "add"
                  ? "Add New User"
                  : "Edit User"}
              </h2>
            </div>
            <button
              onClick={() => {
                if (view !== "list") {
                  setView("list");
                } else {
                  onClose();
                }
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {view === "list" ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Total: {users.length} user(s)
                </p>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add User
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            {user.role.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.email)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="userEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="userEmail"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="userRole"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="userRole"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="POLLING_OFFICER">Polling Officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {view === "add" && (
                <>
                  <div>
                    <label
                      htmlFor="userPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <input
                      id="userPassword"
                      type="password"
                      required={view === "add"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Minimum 8 characters"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="userConfirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="userConfirmPassword"
                      type="password"
                      required={view === "add"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Re-enter password"
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              {view === "edit" && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600">
                    <strong>Note:</strong> Password cannot be changed here.
                    Users can change their own password in their profile
                    settings.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  disabled={loading}
                >
                  {loading
                    ? view === "add"
                      ? "Creating..."
                      : "Updating..."
                    : view === "add"
                    ? "Add User"
                    : "Update User"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= MANAGE POLLING STATIONS MODAL =============
interface ManagePollingStationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManagePollingStationsModal({
  isOpen,
  onClose,
  onSuccess,
}: ManagePollingStationsModalProps) {
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [stations, setStations] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    registeredVoters: 0,
    rejectedVotes: 0,
    constituencyId: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchStations();
      fetchConstituencies();
    }
  }, [isOpen]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const data = await getAllPollingStations();
      setStations(data);
    } catch {
      showToast.error("Failed to load polling stations");
    } finally {
      setLoading(false);
    }
  };

  const fetchConstituencies = async () => {
    try {
      const res = await getAllConstituencies();
      const list = Array.isArray(res)
        ? res
        : res?.data || res?.constituencies || [];
      setConstituencies(list);
    } catch {
      showToast.error("Failed to load constituencies");
      setConstituencies([]);
    }
  };

  const handleAdd = () => {
    setView("add");
    setFormData({
      name: "",
      code: "",
      location: "",
      registeredVoters: 0,
      rejectedVotes: 0,
      constituencyId: "",
    });
    setError("");
  };

  const handleEdit = (station: any) => {
    setEditingStation(station);
    setFormData({
      name: station.name,
      code: station.code,
      location: station.location || "",
      registeredVoters: station.registeredVoters,
      rejectedVotes: station.rejectedVotes,
      constituencyId: station.constituencyId,
    });
    setView("edit");
    setError("");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete polling station: ${name}?`))
      return;
    try {
      await deletePollingStation(id);
      showToast.success("Polling station deleted successfully!");
      fetchStations();
    } catch {
      showToast.error("Failed to delete polling station");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      if (view === "add") {
        await createPollingStation(formData);
        showToast.success("Polling station created successfully!");
      } else {
        await updatePollingStation(editingStation.id, formData);
        showToast.success("Polling station updated successfully!");
      }
      setView("list");
      fetchStations();
      onSuccess?.();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (view === "add"
          ? "Failed to create polling station"
          : "Failed to update polling station");
      setError(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {view === "list"
                  ? "Manage Polling Stations"
                  : view === "add"
                  ? "Add New Polling Station"
                  : "Edit Polling Station"}
              </h2>
            </div>
            <button
              onClick={() => (view !== "list" ? setView("list") : onClose())}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {view === "list" ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Total: {stations.length} station(s)
                </p>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Polling Station
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : stations.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No polling stations found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {stations.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        <p className="text-sm text-gray-600">
                          Code: {s.code} | Constituency:{" "}
                          {s.constituency?.name || "N/A"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(s)}
                          className="px-3 py-1 text-sm bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Polling Station Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Constituency
                  </label>
                  <select
                    required
                    value={formData.constituencyId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        constituencyId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">Select Constituency</option>
                    {Array.isArray(constituencies) &&
                      constituencies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registered Voters
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.registeredVoters}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registeredVoters: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejected Votes
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.rejectedVotes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rejectedVotes: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
                  disabled={loading}
                >
                  {loading
                    ? view === "add"
                      ? "Creating..."
                      : "Updating..."
                    : view === "add"
                    ? "Add Polling Station"
                    : "Update Polling Station"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= MANAGE PARTIES MODAL =============
interface ManagePartiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManagePartiesModal({
  isOpen,
  onClose,
  onSuccess,
}: ManagePartiesModalProps) {
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingParty, setEditingParty] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    color: "#0066CC",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchParties();
    }
  }, [isOpen]);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const data = await getAllParties();
      setParties(data);
    } catch (err: any) {
      showToast.error("Failed to load parties");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setView("add");
    setFormData({ name: "", abbreviation: "", color: "#0066CC" });
    setError("");
  };

  const handleEdit = (party: any) => {
    setEditingParty(party);
    setFormData({
      name: party.name,
      abbreviation: party.abbreviation,
      color: party.color,
    });
    setView("edit");
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this party?")) return;

    try {
      await deleteParty(id);
      showToast.success("Party deleted successfully!");
      fetchParties();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Failed to delete party");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      if (view === "add") {
        await createParty({
          name: formData.name,
          abbreviation: formData.abbreviation,
          color: formData.color,
        });
        showToast.success("Party created successfully!");
      } else {
        await updateParty(editingParty.id, formData);
        showToast.success("Party updated successfully!");
      }
      setView("list");
      fetchParties();
      onSuccess?.();
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to save party";
      setError(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {view === "list"
                  ? "Manage Parties"
                  : view === "add"
                  ? "Add Party"
                  : "Edit Party"}
              </h2>
            </div>
            <button
              onClick={() => {
                if (view !== "list") {
                  setView("list");
                } else {
                  onClose();
                }
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {view === "list" ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Total: {parties.length} party(ies)
                </p>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Add Party
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : parties.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No parties found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {parties.map((party) => (
                    <div
                      key={party.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: party.color }}
                        >
                          {party.abbreviation}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {party.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {party._count?.candidates || 0} candidate(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(party)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(party.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="partyName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Party Name
                </label>
                <input
                  id="partyName"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., National Democratic Congress"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="partyAbbreviation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Abbreviation
                </label>
                <input
                  id="partyAbbreviation"
                  type="text"
                  required
                  value={formData.abbreviation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      abbreviation: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., NDC"
                  maxLength={10}
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="partyColor"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Party Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    id="partyColor"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-20 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    disabled={loading}
                  />
                  <input
                    id="partyColorText"
                    type="text"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="#0066CC"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="px-4 py-2 rounded-lg text-white font-semibold"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.abbreviation || "ABC"}
                  </div>
                  <span className="text-gray-700">
                    {formData.name || "Party Name"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-yellow-400"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : view === "add"
                    ? "Add Party"
                    : "Update Party"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= MANAGE CANDIDATES MODAL =============
interface ManageCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ManageCandidatesModal({
  isOpen,
  onClose,
  onSuccess,
}: ManageCandidatesModalProps) {
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "PRESIDENTIAL" as "PRESIDENTIAL" | "PARLIAMENTARY",
    partyId: "",
    constituencyId: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesData, partiesData, constituenciesData] =
        await Promise.all([
          getAllCandidatesAdmin(),
          getAllParties(),
          getAllConstituencies(),
        ]);
      console.log("Constituencies loaded:", constituenciesData);
      setCandidates(candidatesData);
      setParties(partiesData);
      setConstituencies(constituenciesData.constituencies || []);
    } catch (err: any) {
      console.error("Error loading data:", err);
      showToast.error("Failed to load data");
      setCandidates([]);
      setParties([]);
      setConstituencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setView("add");
    setFormData({
      name: "",
      type: "PRESIDENTIAL",
      partyId: "",
      constituencyId: "",
    });
    setError("");
  };

  const handleEdit = (candidate: any) => {
    setEditingCandidate(candidate);
    setFormData({
      name: candidate.name,
      type: candidate.type,
      partyId: candidate.partyId,
      constituencyId: candidate.constituencyId || "",
    });
    setView("edit");
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;

    try {
      await deleteCandidateAdmin(id);
      showToast.success("Candidate deleted successfully!");
      fetchData();
    } catch (err: any) {
      showToast.error(
        err.response?.data?.message || "Failed to delete candidate"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.type === "PARLIAMENTARY" && !formData.constituencyId) {
      setError("Constituency is required for parliamentary candidates");
      return;
    }

    try {
      setLoading(true);
      if (view === "add") {
        await createCandidateAdmin({
          name: formData.name,
          type: formData.type,
          partyId: formData.partyId,
          ...(formData.constituencyId && {
            constituencyId: formData.constituencyId,
          }),
        });
        showToast.success("Candidate created successfully!");
      } else {
        await updateCandidateAdmin(editingCandidate.id, {
          name: formData.name,
          partyId: formData.partyId,
          ...(formData.constituencyId && {
            constituencyId: formData.constituencyId,
          }),
        });
        showToast.success("Candidate updated successfully!");
      }
      setView("list");
      fetchData();
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save candidate");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {view === "list"
                  ? "Manage Candidates"
                  : view === "add"
                  ? "Add Candidate"
                  : "Edit Candidate"}
              </h2>
            </div>
            <button
              onClick={() => {
                if (view !== "list") {
                  setView("list");
                } else {
                  onClose();
                }
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {view === "list" ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Total: {candidates.length} candidate(s)
                </p>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Candidate
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No candidates found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">
                            {candidate.name}
                          </p>
                          <span
                            className="px-2 py-0.5 text-xs font-semibold rounded text-white"
                            style={{
                              backgroundColor:
                                candidate.party?.color || "#gray",
                            }}
                          >
                            {candidate.party?.abbreviation}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {candidate.type}
                          {candidate.constituency &&
                            ` - ${candidate.constituency.name}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(candidate)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(candidate.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="candidateName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Candidate Name
                </label>
                <input
                  id="candidateName"
                  name="candidateName"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., John Mahama"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="candidateType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Type
                </label>
                <select
                  id="candidateType"
                  name="candidateType"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "PRESIDENTIAL" | "PARLIAMENTARY",
                      constituencyId:
                        e.target.value === "PRESIDENTIAL"
                          ? ""
                          : formData.constituencyId,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading || view === "edit"}
                >
                  <option value="PRESIDENTIAL">Presidential</option>
                  <option value="PARLIAMENTARY">Parliamentary</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="party"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Party
                </label>
                <select
                  id="party"
                  name="party"
                  required
                  value={formData.partyId}
                  onChange={(e) =>
                    setFormData({ ...formData, partyId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select a party</option>
                  {parties.map((party) => (
                    <option key={party.id} value={party.id}>
                      {party.name} ({party.abbreviation})
                    </option>
                  ))}
                </select>
              </div>
              {formData.type === "PARLIAMENTARY" && (
                <div>
                  <label
                    htmlFor="constituency"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Constituency
                  </label>
                  <select
                    id="constituency"
                    name="constituency"
                    required
                    value={formData.constituencyId}
                    onChange={(e) => {
                      console.log("Selected constituency:", e.target.value); // DEBUG
                      setFormData({
                        ...formData,
                        constituencyId: e.target.value,
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  >
                    <option value="">Select a constituency</option>
                    {constituencies && constituencies.length > 0 ? (
                      constituencies.map((constituency: any) => (
                        <option key={constituency.id} value={constituency.id}>
                          {constituency.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Loading constituencies...
                      </option>
                    )}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : view === "add"
                    ? "Add Candidate"
                    : "Update Candidate"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
// ============= EXPORT DATA MODAL =============
interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDataModal({ isOpen, onClose }: ExportDataModalProps) {
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [selectedData, setSelectedData] = useState<string[]>(["presidential"]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (selectedData.length === 0) {
      showToast.error("Please select at least one data type");
      return;
    }

    try {
      setLoading(true);
      const blob = await exportData(selectedFormat, selectedData);

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `election-results-${Date.now()}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast.success(`Data exported as ${selectedFormat.toUpperCase()}!`);
      onClose();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const toggleDataType = (type: string) => {
    if (selectedData.includes(type)) {
      setSelectedData(selectedData.filter((t) => t !== type));
    } else {
      setSelectedData([...selectedData, type]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export Format
              </label>
              <div className="space-y-2">
                {["csv", "json"].map((format) => (
                  <label
                    key={format}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={selectedFormat === format}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-4 h-4 text-green-600"
                      disabled={loading}
                    />
                    <span className="ml-3 text-gray-900 font-medium uppercase">
                      {format}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Data to Export
              </label>
              <div className="space-y-2">
                {[
                  { id: "presidential", label: "Presidential Results" },
                  { id: "parliamentary", label: "Parliamentary Results" },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedData.includes(item.id)}
                      onChange={() => toggleDataType(item.id)}
                      className="w-4 h-4 text-green-600 rounded"
                      disabled={loading}
                    />
                    <span className="ml-3 text-gray-900">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center gap-2"
                disabled={loading || selectedData.length === 0}
              >
                <Download className="w-4 h-4" />
                {loading ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============= SYSTEM SETTINGS MODAL =============
interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemSettingsModal({
  isOpen,
  onClose,
}: SystemSettingsModalProps) {
  const [settings, setSettings] = useState({
    allowResultSubmission: true,
    requireApproval: false,
    enableNotifications: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const data = await getSystemSettings();
      setSettings({
        allowResultSubmission: data.allowResultSubmission,
        requireApproval: data.requireApproval,
        enableNotifications: data.enableNotifications,
        maintenanceMode: data.maintenanceMode,
      });
    } catch (err: any) {
      showToast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateSystemSettings(settings);
      showToast.success("Settings saved successfully!");
      onClose();
    } catch (err: any) {
      showToast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Settings className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                System Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {fetching ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading settings...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Allow Result Submission
                    </p>
                    <p className="text-sm text-gray-600">
                      Enable polling officers to submit results
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allowResultSubmission}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          allowResultSubmission: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Require Admin Approval
                    </p>
                    <p className="text-sm text-gray-600">
                      Results need admin verification
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.requireApproval}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requireApproval: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Enable Notifications
                    </p>
                    <p className="text-sm text-gray-600">
                      Real-time alerts for new submissions
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          enableNotifications: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">Maintenance Mode</p>
                    <p className="text-sm text-red-600">
                      Disable public access temporarily
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maintenanceMode: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= VIEW AUDIT LOGS MODAL =============
interface ViewAuditLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ViewAuditLogsModal({
  isOpen,
  onClose,
}: ViewAuditLogsModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(50);
      setLogs(data.logs || []);
    } catch (err: any) {
      showToast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
                <p className="text-sm text-gray-600">System activity history</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {log.action}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {log.user?.email || "Unknown User"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{log.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
