import { useEffect, useState } from "react";
import { Trophy, TrendingUp, Users, RefreshCw } from "lucide-react";
import {
  getPresidentialResults,
  getNationalAggregation,
} from "../services/api.ts";
import type { CandidateResult, NationalStats } from "../types/index.ts";

export default function PresidentialResults() {
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [nationalStats, setNationalStats] = useState<NationalStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchResults = async () => {
    try {
      setIsRefreshing(true);
      const [resultsData, statsData] = await Promise.all([
        getPresidentialResults(),
        getNationalAggregation(),
      ]);

      setCandidates(resultsData.candidates || []);
      setNationalStats(statsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchResults, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  const leadingCandidate = candidates[0];
  const reportingPercentage = nationalStats
    ? (
        (nationalStats.reportingStations / nationalStats.totalStations) *
        100
      ).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Live Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Presidential Election 2024</h1>
              <p className="text-blue-100">Live Results</p>
            </div>
          </div>

          <button
            onClick={fetchResults}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
              <Users className="w-4 h-4" />
              Total Votes
            </div>
            <div className="text-2xl font-bold">
              {nationalStats?.totalVotes.toLocaleString() || "0"}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Turnout
            </div>
            <div className="text-2xl font-bold">
              {nationalStats?.turnout.toFixed(1) || "0"}%
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="text-blue-100 text-sm mb-1">Reporting Stations</div>
            <div className="text-2xl font-bold">
              {nationalStats?.reportingStations.toLocaleString() || "0"} /{" "}
              {nationalStats?.totalStations.toLocaleString() || "0"}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
            <div className="text-blue-100 text-sm mb-1">Reporting</div>
            <div className="text-2xl font-bold">{reportingPercentage}%</div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-4 text-blue-100 text-sm text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Leading Candidate Banner */}
      {leadingCandidate && (
        <div
          className="bg-white rounded-xl shadow-lg p-6 border-l-4"
          style={{ borderColor: leadingCandidate.party.color }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trophy
                className="w-12 h-12"
                style={{ color: leadingCandidate.party.color }}
              />
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Currently Leading
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {leadingCandidate.name}
                </h2>
                <p
                  className="text-lg font-semibold"
                  style={{ color: leadingCandidate.party.color }}
                >
                  {leadingCandidate.party.abbreviation}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {leadingCandidate.percentage.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">
                {leadingCandidate.votes.toLocaleString()} votes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Candidates Results */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">All Candidates</h3>
        <div className="space-y-4">
          {candidates.map((candidate, index) => (
            <div key={candidate.id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {candidate.name}
                    </h4>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-white text-sm font-semibold"
                      style={{ backgroundColor: candidate.party.color }}
                    >
                      {candidate.party.abbreviation}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {candidate.percentage.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {candidate.votes.toLocaleString()} votes
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
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

      {/* Valid vs Rejected Votes */}
      {nationalStats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Vote Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Valid Votes</p>
              <p className="text-2xl font-bold text-green-600">
                {nationalStats.validVotes.toLocaleString()}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Rejected Votes</p>
              <p className="text-2xl font-bold text-red-600">
                {nationalStats.rejectedVotes.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Cast</p>
              <p className="text-2xl font-bold text-blue-600">
                {nationalStats.totalVotes.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
