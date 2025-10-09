import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION
// ============================================

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  if (response.data.token) {
    localStorage.setItem("authToken", response.data.token);
  }
  return response.data;
};

export const register = async (
  email: string,
  password: string,
  role?: string
) => {
  const response = await api.post("/auth/register", { email, password, role });
  if (response.data.token) {
    localStorage.setItem("authToken", response.data.token);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await api.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("authToken");
  window.location.href = "/login";
};

// ============================================
// PRESIDENTIAL RESULTS
// ============================================

export const getPresidentialResults = async () => {
  const response = await api.get("/results/presidential");
  return response.data;
};

export const getPresidentialCandidates = async () => {
  const response = await api.get("/candidates/presidential");
  return response.data;
};

// ============================================
// PARLIAMENTARY RESULTS
// ============================================

export const getParliamentaryResults = async (constituencyId: string) => {
  const response = await api.get(`/results/parliamentary/${constituencyId}`);
  return response.data;
};

export const getParliamentaryCandidates = async (constituencyId: string) => {
  const response = await api.get(`/candidates/parliamentary/${constituencyId}`);
  return response.data;
};

// ============================================
// CONSTITUENCIES (All 275)
// ============================================

export const getAllConstituencies = async (region?: string) => {
  const params = region ? { region } : {};
  const response = await api.get("/constituencies", { params });
  return response.data;
};

export const getConstituencyById = async (id: string) => {
  const response = await api.get(`/constituencies/${id}`);
  return response.data;
};

export const getConstituencyResults = async (id: string) => {
  const response = await api.get(`/constituencies/${id}/results`);
  return response.data;
};

export const getConstituenciesByRegion = async (region: string) => {
  const response = await api.get(`/constituencies/region/${region}`);
  return response.data;
};

export const createConstituency = async (
  name: string,
  region: string,
  pollingStations?: number,
  registeredVoters?: number
) => {
  const response = await api.post("/constituencies", {
    name,
    region,
    pollingStations,
    registeredVoters,
  });
  return response.data;
};

// ============================================
// REGIONS
// ============================================

export const getAllRegions = async () => {
  const response = await api.get("/regions");
  return response.data;
};

export const getRegionByName = async (name: string) => {
  const response = await api.get(`/regions/${name}`);
  return response.data;
};

export const getRegionResults = async (region: string) => {
  const response = await api.get(`/results/region/${region}`);
  return response.data;
};

// ============================================
// POLLING STATIONS
// ============================================

export const getAllPollingStations = async (constituencyId?: string) => {
  const params = constituencyId ? { constituencyId } : {};
  const response = await api.get("/polling-stations", { params });
  return response.data;
};

export const getPollingStationById = async (id: string) => {
  const response = await api.get(`/polling-stations/${id}`);
  return response.data;
};

export const createPollingStation = async (data: {
  code: string;
  name: string;
  constituencyId: string;
  location?: string;
}) => {
  const response = await api.post("/polling-stations", data);
  return response.data;
};

export const updatePollingStation = async (
  id: string,
  data: {
    name?: string;
    code?: string;
    location?: string;
    registeredVoters?: number;
    rejectedVotes?: number;
  }
) => {
  const response = await api.put(`/polling-stations/${id}`, data);
  return response.data;
};

export const deletePollingStation = async (id: string) => {
  const response = await api.delete(`/polling-stations/${id}`);
  return response.data;
};

// ============================================
// PARTIES
// ============================================

export const getAllParties = async () => {
  const response = await api.get("/parties");
  return response.data;
};

export const getPartyById = async (id: string) => {
  const response = await api.get(`/parties/${id}`);
  return response.data;
};

export const createParty = async (data: {
  name: string;
  abbreviation: string;
  color: string;
  logoUrl?: string;
}) => {
  const response = await api.post("/parties", data);
  return response.data;
};
export const updateParty = async (
  id: string,
  data: {
    name?: string;
    abbreviation?: string;
    color?: string;
    logoUrl?: string;
  }
) => {
  const response = await api.put(`/admin/parties/${id}`, data);
  return response.data;
};

export const deleteParty = async (id: string) => {
  const response = await api.delete(`/admin/parties/${id}`);
  return response.data;
};

// ============================================
// RESULTS SUBMISSION (Officers Only)
// ============================================

export const submitResult = async (data: {
  pollingStationId: string;
  candidateId: string;
  votes: number;
}) => {
  const response = await api.post("/results", data);
  return response.data;
};

export const updateResult = async (id: string, votes: number) => {
  const response = await api.put(`/results/${id}`, { votes });
  return response.data;
};

// ============================================
// CANDIDATES
// ============================================

export const getAllCandidatesAdmin = async (
  type?: string,
  constituencyId?: string
) => {
  const params: any = {};
  if (type) params.type = type;
  if (constituencyId) params.constituencyId = constituencyId;

  const response = await api.get("/admin/candidates", { params });
  return response.data;
};

export const createCandidateAdmin = async (data: {
  name: string;
  type: "PRESIDENTIAL" | "PARLIAMENTARY";
  partyId: string;
  constituencyId?: string;
}) => {
  const response = await api.post("/admin/candidates", data);
  return response.data;
};

export const updateCandidateAdmin = async (
  id: string,
  data: {
    name?: string;
    partyId?: string;
    constituencyId?: string;
  }
) => {
  const response = await api.put(`/admin/candidates/${id}`, data);
  return response.data;
};

export const deleteCandidateAdmin = async (id: string) => {
  const response = await api.delete(`/admin/candidates/${id}`);
  return response.data;
};
// ============================================
// ADMIN - USER MANAGEMENT
// ============================================

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: {
    email?: string;
    role?: string;
  }
) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};
// ============================================
// ADMIN - SYSTEM SETTINGS
// ============================================

export const getSystemSettings = async () => {
  const response = await api.get("/admin/settings");
  return response.data;
};

export const updateSystemSettings = async (settings: {
  allowResultSubmission?: boolean;
  requireApproval?: boolean;
  enableNotifications?: boolean;
  maintenanceMode?: boolean;
}) => {
  const response = await api.put("/admin/settings", settings);
  return response.data;
};

// ============================================
// ADMIN - AUDIT LOGS
// ============================================

export const getAuditLogs = async (limit = 50, offset = 0) => {
  const response = await api.get("/admin/audit-logs", {
    params: { limit, offset },
  });
  return response.data;
};

// ============================================
// ADMIN - DATA EXPORT
// ============================================

export const exportData = async (format: string, dataTypes: string[]) => {
  const response = await api.post(
    "/admin/export",
    { format, dataTypes },
    { responseType: format === "json" ? "json" : "blob" }
  );
  return response.data;
};

// ============================================
// ADMIN - DASHBOARD STATISTICS
// ============================================

export const getDashboardStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export default api;
