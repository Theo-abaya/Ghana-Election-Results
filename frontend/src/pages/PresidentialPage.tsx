import { useEffect, useState } from "react";
import {
  Trophy,
  TrendingUp,
  Users,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getPresidentialResults } from "../services/api";
import { usePresidentialWebSocket } from "../hooks/useWebSocket";
import { showToast } from "../utils/toast";
import type { CandidateResult, NationalStats } from "../types";

export default function PresidentialPage() {
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [nationalStats, setNationalStats] = useState<NationalStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast.success("Connection restored");
      fetchResults();
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

  const fetchResults = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const data = await getPresidentialResults();

      if (!data.candidates || data.candidates.length === 0) {
        setError("No presidential results available yet");
      } else {
        setCandidates(data.candidates);
        setNationalStats(data.nationalStats);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      console.error("Error fetching results:", err);
      const errorMessage =
        err.response?.status === 404
          ? "Presidential results not yet available"
          : "Failed to load results. Please try again.";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  usePresidentialWebSocket((data) => {
    console.log("Received real-time update:", data);
    if (data.candidates) {
      setCandidates(data.candidates);
    }
    if (data.nationalStats) {
      setNationalStats(data.nationalStats);
    }
    setLastUpdated(new Date());
  });

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gray-200 rounded-xl h-48"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 rounded-xl h-80"></div>
        <div className="bg-gray-200 rounded-xl h-80"></div>
      </div>
      <div className="bg-gray-200 rounded-xl h-96"></div>
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
        Unable to Load Results
      </h3>
      <p className="text-gray-600 mb-4 px-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && candidates.length === 0) {
    return <ErrorState message={error} onRetry={fetchResults} />;
  }

  const leadingCandidate = candidates[0];
  const reportingPercentage = nationalStats
    ? (
        (nationalStats.reportingStations / nationalStats.totalStations) *
        100
      ).toFixed(1)
    : 0;

  // Prepare data for charts
  const pieChartData = candidates.map((c) => ({
    name: c.party.abbreviation,
    value: c.votes,
    percentage: c.percentage,
    color: c.party.color,
  }));

  const barChartData = candidates.map((c) => ({
    name: c.party.abbreviation,
    votes: c.votes,
    percentage: c.percentage.toFixed(2),
  }));

  const voteBreakdownData = nationalStats
    ? [
        {
          name: "Valid Votes",
          value: nationalStats.validVotes,
          color: "#10B981",
        },
        {
          name: "Rejected Votes",
          value: nationalStats.rejectedVotes,
          color: "#EF4444",
        },
      ]
    : [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            Votes: {(data.value as number).toLocaleString()}
          </p>
          {data.payload.percentage && (
            <p className="text-sm text-gray-600">
              {(data.payload.percentage as number).toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

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

      {/* Header with Live Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Presidential Election 2024
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {isOnline && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <p className="text-blue-100 text-sm">Live Updates</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={fetchResults}
            disabled={isRefreshing || !isOnline}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-blue-100 text-xs sm:text-sm mb-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Total Votes</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {nationalStats?.totalVotes.toLocaleString() || "0"}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-blue-100 text-xs sm:text-sm mb-1">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Turnout</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {nationalStats?.turnout.toFixed(1) || "0"}%
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="text-blue-100 text-xs sm:text-sm mb-1">
              Reporting Stations
            </div>
            <div className="text-lg sm:text-2xl font-bold">
              {nationalStats?.reportingStations.toLocaleString() || "0"} /{" "}
              {nationalStats?.totalStations.toLocaleString() || "0"}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur">
            <div className="text-blue-100 text-xs sm:text-sm mb-1">
              Reporting
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {reportingPercentage}%
            </div>
          </div>
        </div>

        <div className="mt-4 text-blue-100 text-xs sm:text-sm text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Leading Candidate Banner */}
      {leadingCandidate && (
        <div
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4"
          style={{ borderColor: leadingCandidate.party.color }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Trophy
                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                style={{ color: leadingCandidate.party.color }}
              />
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Currently Leading
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-1">
                  {leadingCandidate.name}
                </h2>
                <p
                  className="text-base sm:text-lg font-semibold"
                  style={{ color: leadingCandidate.party.color }}
                >
                  {leadingCandidate.party.abbreviation}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                {leadingCandidate.percentage.toFixed(2)}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {leadingCandidate.votes.toLocaleString()} votes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Vote Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Vote Distribution
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) =>
                    `${props.name}: ${props.percentage.toFixed(1)}%`
                  }
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Vote Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Vote Comparison
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="votes"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                >
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={candidates[index]?.party.color || "#3B82F6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* All Candidates Results */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
          All Candidates
        </h3>
        <div className="space-y-4">
          {candidates.map((candidate, index) => (
            <div key={candidate.id} className="relative">
              <div className="flex items-center justify-between mb-2 gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xl sm:text-2xl font-bold text-gray-400 flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">
                      {candidate.name}
                    </h4>
                    <span
                      className="inline-block px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-semibold mt-1"
                      style={{ backgroundColor: candidate.party.color }}
                    >
                      {candidate.party.abbreviation}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {candidate.percentage.toFixed(2)}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {candidate.votes.toLocaleString()} votes
                  </div>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${candidate.percentage}%`,
                    backgroundColor: candidate.party.color,
                  }}
                >
                  {candidate.percentage > 5 && (
                    <span className="text-white text-xs font-bold">
                      {candidate.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valid vs Rejected Votes with Chart */}
      {nationalStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Vote Breakdown
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Valid Votes
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {nationalStats.validVotes.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Rejected Votes
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {nationalStats.rejectedVotes.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  Total Cast
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {nationalStats.totalVotes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Vote Validity Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              Vote Validity
            </h3>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={voteBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) =>
                      `${props.name}: ${props.value.toLocaleString()}`
                    }
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={800}
                  >
                    {voteBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
