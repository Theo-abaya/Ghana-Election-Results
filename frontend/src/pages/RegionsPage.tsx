import {
  MapPin,
  Users,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAllRegions, getRegionResults } from "../services/api";
import { useRegionWebSocket } from "../hooks/useWebSocket";
import { showToast } from "../utils/toast";
import type { Region, RegionResult } from "../types";

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionResult, setRegionResult] = useState<RegionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast.success("Connection restored");
      fetchRegions();
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
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRegions();

      if (!data || data.length === 0) {
        setError("No regional data available");
      } else {
        setRegions(data);
      }
    } catch (err: any) {
      console.error("Error fetching regions:", err);
      const errorMessage =
        err.response?.status === 404
          ? "Regional data not yet available"
          : "Failed to load regions. Please try again.";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionResult = async (regionName: string) => {
    try {
      setIsRefreshing(true);
      const data = await getRegionResults(regionName);
      setRegionResult(data);
      setSelectedRegion(regionName);
    } catch (err: any) {
      console.error("Error fetching region result:", err);
      showToast.error("Failed to load regional results");
    } finally {
      setIsRefreshing(false);
    }
  };

  useRegionWebSocket(selectedRegion || "", (data) => {
    if (selectedRegion) {
      setRegionResult(data);
    }
  });

  const totalStats = {
    totalRegions: regions.length,
    totalConstituencies: regions.reduce((sum, r) => sum + r.constituencies, 0),
    totalPollingStations: regions.reduce(
      (sum, r) => sum + (r.pollingStations || 0),
      0
    ),
    totalVotes: regions.reduce((sum, r) => sum + (r.totalVotes || 0), 0),
  };

  // Prepare data for regional comparison chart
  const regionalChartData = regions.slice(0, 10).map((r) => ({
    name: r.name.replace(/_/g, " ").substring(0, 15),
    votes: r.totalVotes,
    stations: r.pollingStations,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-gray-600">
            Votes: {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-md p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
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
    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
      <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Unable to Load Regions
      </h3>
      <p className="text-gray-600 mb-4 px-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
          <WifiOff className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-orange-800">You're Offline</p>
            <p className="text-orange-700 text-sm">
              Displaying cached data. Some features may be unavailable.
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-10" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Regional Analysis
              </h1>
              <p className="text-purple-100 text-sm sm:text-base">
                Electoral Performance by Region
              </p>
            </div>
          </div>

          {isOnline && (
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <Wifi className="w-4 h-4" />
              <span>Live</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-purple-100 text-xs sm:text-sm mb-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Total Regions</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {totalStats.totalRegions}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-purple-100 text-xs sm:text-sm mb-1">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Total Votes</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {totalStats.totalVotes.toLocaleString()}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-purple-100 text-xs sm:text-sm mb-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Constituencies</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {totalStats.totalConstituencies}
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="text-purple-100 text-xs sm:text-sm mb-1">
              Polling Stations
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {totalStats.totalPollingStations.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Comparison Chart */}
      {!loading && !error && regions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Regional Vote Comparison
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="votes"
                  fill="#9333EA"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Regional Cards Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRegions} />
      ) : regions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No regional data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 border border-gray-100 overflow-hidden cursor-pointer"
              onClick={() => fetchRegionResult(region.name)}
            >
              {/* Region Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    <h3 className="text-base sm:text-lg font-bold line-clamp-1">
                      {region.name.replace(/_/g, " ")}
                    </h3>
                  </div>
                  {isRefreshing && selectedRegion === region.name && (
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  )}
                </div>
              </div>

              {/* Region Stats */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Constituencies
                    </span>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      {region.constituencies}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Polling Stations
                    </span>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      {region.pollingStations}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-gray-600">
                      Total Votes
                    </span>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">
                      {region.totalVotes.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-4 text-center py-2 text-sm border border-purple-600 rounded-lg text-purple-600 font-medium hover:bg-purple-50 transition-colors">
                  View Detailed Results →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Region Details */}
      {regionResult && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-2">
              {regionResult.region.name.replace(/_/g, " ")} - Detailed Results
            </h2>
            <button
              onClick={() => setRegionResult(null)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Close
            </button>
          </div>

          {/* Presidential Results in Region */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Presidential Results
            </h3>
            <div className="space-y-3">
              {regionResult.presidential.candidates.map((candidate, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-base sm:text-lg font-bold text-gray-400 flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                          {candidate.name}
                        </p>
                        <span
                          className="inline-block px-2 py-1 rounded text-white text-xs font-semibold"
                          style={{ backgroundColor: candidate.party.color }}
                        >
                          {candidate.party.abbreviation}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        {candidate.percentage.toFixed(2)}%
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {candidate.votes.toLocaleString()} votes
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${candidate.percentage}%`,
                        backgroundColor: candidate.party.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parliamentary Summary */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Parliamentary Results ({regionResult.parliamentary.totalSeats}{" "}
              Seats)
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {regionResult.parliamentary.constituencies.map(
                (constituency, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base line-clamp-1">
                        {constituency.constituencyName}
                      </p>
                      {constituency.winner && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                          Winner:{" "}
                          <span className="font-semibold">
                            {constituency.winner.name}
                          </span>{" "}
                          ({constituency.winner.party})
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        {constituency.totalVotes.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">votes</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Regional Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Total Votes
              </p>
              <p className="text-lg sm:text-xl font-bold text-purple-600">
                {regionResult.stats.totalVotesCast.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Turnout</p>
              <p className="text-lg sm:text-xl font-bold text-purple-600">
                {regionResult.stats.turnout.toFixed(1)}%
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Polling Stations
              </p>
              <p className="text-lg sm:text-xl font-bold text-purple-600">
                {regionResult.stats.totalPollingStations}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Leading Party
              </p>
              <p className="text-base sm:text-xl font-bold text-purple-600 line-clamp-1">
                {regionResult.presidential.leadingParty}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
