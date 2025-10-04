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

export const createConstituency = async (name: string, region: string) => {
  const response = await api.post("/constituencies", { name, region });
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

export const createCandidate = async (data: {
  name: string;
  type: "PRESIDENTIAL" | "PARLIAMENTARY";
  partyId: string;
  constituencyId?: string;
}) => {
  const response = await api.post("/candidates", data);
  return response.data;
};

export default api;
