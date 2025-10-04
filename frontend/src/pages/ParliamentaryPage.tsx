import {
  Users,
  MapPin,
  Search,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getAllConstituencies, getConstituencyResults } from "../services/api";
import { useConstituencyWebSocket } from "../hooks/useWebSocket";
import { showToast } from "../utils/toast";
import type { Constituency, ConstituencyResult } from "../types";

export default function ParliamentaryPage() {
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedConstituency, setSelectedConstituency] = useState<
    string | null
  >(null);
  const [constituencyResult, setConstituencyResult] =
    useState<ConstituencyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const regions = [
    { value: "all", label: "All Regions" },
    { value: "GREATER_ACCRA", label: "Greater Accra" },
    { value: "ASHANTI", label: "Ashanti" },
    { value: "EASTERN", label: "Eastern" },
    { value: "CENTRAL", label: "Central" },
    { value: "WESTERN", label: "Western" },
    { value: "VOLTA", label: "Volta" },
    { value: "NORTHERN", label: "Northern" },
    { value: "UPPER_EAST", label: "Upper East" },
    { value: "UPPER_WEST", label: "Upper West" },
    { value: "SAVANNAH", label: "Savannah" },
    { value: "BONO", label: "Bono" },
    { value: "BONO_EAST", label: "Bono East" },
    { value: "AHAFO", label: "Ahafo" },
    { value: "WESTERN_NORTH", label: "Western North" },
    { value: "OTI", label: "Oti" },
    { value: "NORTH_EAST", label: "North East" },
  ];

  const partyColors: Record<string, string> = {
    NPP: "#0066CC",
    NDC: "#006B3F",
    Independent: "#6B7280",
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast.success("Connection restored");
      fetchConstituencies();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast.warning("You're offline. Data may be outdated.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    fetchConstituencies();
  }, [selectedRegion]);

  const fetchConstituencies = async () => {
    try {
      setLoading(true);
      setError(null);
      const region = selectedRegion === "all" ? undefined : selectedRegion;
      const data = await getAllConstituencies(region);

      if (!data.constituencies || data.constituencies.length === 0) {
        setError("No constituencies found for this region");
      } else {
        setConstituencies(data.constituencies);
      }
    } catch (err: any) {
      console.error("Error fetching constituencies:", err);
      const errorMessage =
        err.response?.status === 404
          ? "No data available for this region"
          : "Failed to load constituencies. Please try again.";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchConstituencyResult = async (constituencyId: string) => {
    try {
      setIsRefreshing(true);
      const data = await getConstituencyResults(constituencyId);
      setConstituencyResult(data);
      setSelectedConstituency(constituencyId);
    } catch (err: any) {
      console.error("Error fetching constituency result:", err);
      showToast.error("Failed to load constituency results");
    } finally {
      setIsRefreshing(false);
    }
  };

  useConstituencyWebSocket(selectedConstituency || "", (data) => {
    if (selectedConstituency) {
      setConstituencyResult(data);
    }
  });

  const filteredConstituencies = constituencies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalSeats: 275,
    nppSeats: 137,
    ndcSeats: 135,
    othersSeats: 3,
  };

  // Prepare data for party distribution pie chart
  const partyDistributionData = [
    { name: "NPP", value: stats.nppSeats, color: "#0066CC" },
    { name: "NDC", value: stats.ndcSeats, color: "#006B3F" },
    { name: "Others", value: stats.othersSeats, color: "#6B7280" },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-gray-600">
            {payload[0].value} seats (
            {((payload[0].value / stats.totalSeats) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );

  // Error state component
  const ErrorState = ({
    message,
    onRetry,
  }: {
    message: string;
    onRetry: () => void;
  }) => (
    <div className="text-center py-12">
      <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Unable to Load Data
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-orange-600" />
          <div>
            <p className="font-semibold text-orange-800">You're Offline</p>
            <p className="text-orange-700 text-sm">
              Displaying cached data. Some features may be unavailable.
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 sm:w-10 sm:h-10" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Parliamentary Elections
              </h1>
              <p className="text-green-100 text-sm sm:text-base">
                2024 Constituency Results
              </p>
            </div>
          </div>

          {isOnline && (
            <div className="flex items-center gap-2 text-green-100 text-sm">
              <Wifi className="w-4 h-4" />
              <span>Live</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="text-green-100 text-xs sm:text-sm mb-1">
              Total Seats
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.totalSeats}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="text-green-100 text-xs sm:text-sm mb-1">NPP</div>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.nppSeats}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="text-green-100 text-xs sm:text-sm mb-1">NDC</div>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.ndcSeats}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="text-green-100 text-xs sm:text-sm mb-1">Others</div>
            <div className="text-xl sm:text-2xl font-bold">
              {stats.othersSeats}
            </div>
          </div>
        </div>
      </div>

      {/* Party Distribution Chart */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Parliamentary Seats Distribution
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={partyDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {partyDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar representation with animation */}
          <div className="space-y-4">
            {[
              { party: "NPP", seats: stats.nppSeats, color: "bg-blue-600" },
              { party: "NDC", seats: stats.ndcSeats, color: "bg-green-600" },
              {
                party: "Others",
                seats: stats.othersSeats,
                color: "bg-gray-600",
              },
            ].map(({ party, seats, color }) => (
              <div key={party}>
                <div className="flex justify-between mb-2 text-sm sm:text-base">
                  <span className="font-medium text-gray-700">{party}</span>
                  <span className="font-bold text-gray-900">
                    {seats} seats (
                    {((seats / stats.totalSeats) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                  <div
                    className={`${color} h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: `${(seats / stats.totalSeats) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search constituency or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-xs sm:text-sm text-gray-600">
          Showing {filteredConstituencies.length} of {constituencies.length}{" "}
          constituencies
          {selectedRegion !== "all" && (
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
              {regions.find((r) => r.value === selectedRegion)?.label}
            </span>
          )}
        </div>
      </div>

      {/* Constituencies Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  Constituency
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  Region
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  Stations
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8">
                    <LoadingSkeleton />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8">
                    <ErrorState message={error} onRetry={fetchConstituencies} />
                  </td>
                </tr>
              ) : filteredConstituencies.length > 0 ? (
                filteredConstituencies.map((constituency) => (
                  <tr
                    key={constituency.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        {constituency.name}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {constituency.region.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        {constituency.pollingStations}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <button
                        onClick={() => fetchConstituencyResult(constituency.id)}
                        className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <span>View</span>
                        {isRefreshing &&
                          selectedConstituency === constituency.id && (
                            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">
                      No constituencies found matching "{searchTerm}"
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Constituency Results */}
      {constituencyResult && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2">
              {constituencies.find((c) => c.id === selectedConstituency)?.name}{" "}
              Results
            </h3>
            <button
              onClick={() => setConstituencyResult(null)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Close
            </button>
          </div>

          {constituencyResult.winner && (
            <div className="bg-green-50 rounded-lg p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    Winner
                  </p>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {constituencyResult.winner.candidateName}
                  </h4>
                  <span
                    className="inline-block mt-2 px-3 py-1 rounded-full text-white text-xs sm:text-sm font-semibold"
                    style={{
                      backgroundColor:
                        partyColors[constituencyResult.winner.party],
                    }}
                  >
                    {constituencyResult.winner.party}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {constituencyResult.winner.percentage.toFixed(2)}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {constituencyResult.winner.votes.toLocaleString()} votes
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Total Votes
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {constituencyResult.stats.totalVotes.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Reporting</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {constituencyResult.stats.reportingStations} /{" "}
                {constituencyResult.stats.totalPollingStations}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Progress</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {constituencyResult.stats.reportingPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
