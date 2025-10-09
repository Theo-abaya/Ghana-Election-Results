import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Send, Building, User } from "lucide-react";
import {
  getAllPollingStations,
  getPresidentialCandidates,
  getParliamentaryCandidates,
  submitResult,
} from "../services/api";
import { showToast } from "../utils/toast";

interface PollingStation {
  id: string;
  name: string;
  code: string;
  constituency: {
    id: string;
    name: string;
  };
}

interface Candidate {
  id: string;
  name: string;
  party: { name: string; abbreviation: string; color: string };
  type?: "PRESIDENTIAL" | "PARLIAMENTARY";
  constituencyId?: string;
}

type ElectionType = "PRESIDENTIAL" | "PARLIAMENTARY";

export default function SubmitResultsPage() {
  const [pollingStations, setPollingStations] = useState<PollingStation[]>([]);
  const [presidentialCandidates, setPresidentialCandidates] = useState<
    Candidate[]
  >([]);
  const [parliamentaryCandidates, setParliamentaryCandidates] = useState<
    Candidate[]
  >([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [selectedElectionType, setSelectedElectionType] =
    useState<ElectionType>("PRESIDENTIAL");
  const [results, setResults] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get selected polling station
  const selectedPollingStation = pollingStations.find(
    (station) => station.id === selectedStation
  );

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch parliamentary candidates when polling station changes
  useEffect(() => {
    if (selectedPollingStation && selectedElectionType === "PARLIAMENTARY") {
      fetchParliamentaryCandidates(selectedPollingStation.constituency.id);
    }
  }, [selectedPollingStation, selectedElectionType]);

  const fetchData = async () => {
    try {
      const [stations, presCandidates] = await Promise.all([
        getAllPollingStations(),
        getPresidentialCandidates(),
      ]);
      setPollingStations(stations);
      setPresidentialCandidates(presCandidates);

      // Initialize results object with presidential candidates
      const initialResults: Record<string, number> = {};
      presCandidates.forEach((c: Candidate) => {
        initialResults[c.id] = 0;
      });
      setResults(initialResults);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast.error("Failed to load polling stations and candidates");
    }
  };

  const fetchParliamentaryCandidates = async (constituencyId: string) => {
    try {
      const candidates = await getParliamentaryCandidates(constituencyId);
      setParliamentaryCandidates(candidates);

      // Initialize results for parliamentary candidates
      const parliamentaryResults: Record<string, number> = {};
      candidates.forEach((c: Candidate) => {
        parliamentaryResults[c.id] = 0;
      });

      // Merge with existing results (keep presidential results if they exist)
      setResults((prev) => ({
        ...parliamentaryResults,
        // Preserve presidential results if switching back and forth
        ...Object.fromEntries(
          Object.entries(prev).filter(([key]) =>
            presidentialCandidates.some((pc) => pc.id === key)
          )
        ),
      }));
    } catch (err) {
      console.error("Error fetching parliamentary candidates:", err);
      showToast.error(
        "Failed to load parliamentary candidates for this constituency"
      );
    }
  };

  const handleVoteChange = (candidateId: string, votes: string) => {
    const numVotes = parseInt(votes) || 0;
    setResults((prev) => ({ ...prev, [candidateId]: numVotes }));
  };

  const handleElectionTypeChange = (type: ElectionType) => {
    setSelectedElectionType(type);

    // Reset results when switching election types
    if (type === "PRESIDENTIAL") {
      const initialResults: Record<string, number> = {};
      presidentialCandidates.forEach((c: Candidate) => {
        initialResults[c.id] = 0;
      });
      setResults(initialResults);
    } else if (type === "PARLIAMENTARY" && selectedPollingStation) {
      // Results will be initialized when parliamentary candidates are fetched
      setResults({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!selectedStation) {
      setError("Please select a polling station");
      showToast.warning("Please select a polling station first");
      return;
    }

    const currentCandidates =
      selectedElectionType === "PRESIDENTIAL"
        ? presidentialCandidates
        : parliamentaryCandidates;

    // Check if we have candidates for the selected election type
    if (currentCandidates.length === 0) {
      setError(`No ${selectedElectionType.toLowerCase()} candidates found`);
      showToast.warning(
        `No ${selectedElectionType.toLowerCase()} candidates available`
      );
      return;
    }

    const totalVotes = currentCandidates.reduce(
      (sum, candidate) => sum + (results[candidate.id] || 0),
      0
    );

    if (totalVotes === 0) {
      setError("Please enter at least one vote");
      showToast.warning("Please enter vote counts for at least one candidate");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = showToast.loading("Submitting results...");

    try {
      // Submit results for each candidate in the current election type
      for (const candidate of currentCandidates) {
        const votes = results[candidate.id] || 0;
        if (votes > 0) {
          await submitResult({
            pollingStationId: selectedStation,
            candidateId: candidate.id,
            votes: votes,
          });
        }
      }

      showToast.dismiss(loadingToast);
      const selectedStationName = pollingStations.find(
        (s) => s.id === selectedStation
      )?.name;

      showToast.success(
        `${selectedElectionType} results for ${selectedStationName} submitted successfully!`
      );

      setSuccess(true);

      // Reset form but keep the current election type and polling station
      const initialResults: Record<string, number> = {};
      currentCandidates.forEach((c) => {
        initialResults[c.id] = 0;
      });
      setResults(initialResults);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      showToast.dismiss(loadingToast);
      const errorMessage =
        err.response?.data?.message || "Failed to submit results";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCandidates =
    selectedElectionType === "PRESIDENTIAL"
      ? presidentialCandidates
      : parliamentaryCandidates;

  const totalVotes = currentCandidates.reduce(
    (sum, candidate) => sum + (results[candidate.id] || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Submit Polling Station Results
        </h1>
        <p className="text-gray-600">
          Enter vote counts for your polling station
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-slideIn">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800">
              Results Submitted Successfully!
            </p>
            <p className="text-green-700 text-sm">
              Your {selectedElectionType.toLowerCase()} polling station results
              have been recorded.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Submission Failed</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-6 space-y-6"
      >
        {/* Polling Station Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Polling Station *
          </label>
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            disabled={isSubmitting}
          >
            <option value="">Choose a polling station...</option>
            {pollingStations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.code} - {station.name} ({station.constituency.name})
              </option>
            ))}
          </select>
        </div>

        {/* Election Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Election Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleElectionTypeChange("PRESIDENTIAL")}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedElectionType === "PRESIDENTIAL"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              disabled={isSubmitting}
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Presidential Election</p>
                  <p className="text-sm text-gray-600">
                    National level candidates
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleElectionTypeChange("PARLIAMENTARY")}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedElectionType === "PARLIAMENTARY"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              disabled={isSubmitting || !selectedStation}
            >
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Parliamentary Election</p>
                  <p className="text-sm text-gray-600">
                    {selectedPollingStation
                      ? `${selectedPollingStation.constituency.name} constituency`
                      : "Select polling station first"}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Vote Entry */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {selectedElectionType === "PRESIDENTIAL"
              ? "Presidential Candidates"
              : `Parliamentary Candidates - ${selectedPollingStation?.constituency.name}`}
          </h3>

          {selectedElectionType === "PARLIAMENTARY" && !selectedStation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800">
                Please select a polling station to view parliamentary candidates
              </p>
            </div>
          )}

          {selectedElectionType === "PARLIAMENTARY" &&
            selectedStation &&
            parliamentaryCandidates.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600">
                  {isSubmitting
                    ? "Loading candidates..."
                    : "No parliamentary candidates found for this constituency"}
                </p>
              </div>
            )}

          {currentCandidates.length > 0 && (
            <div className="space-y-4">
              {currentCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {candidate.name}
                    </p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-white text-sm font-semibold mt-1"
                      style={{ backgroundColor: candidate.party.color }}
                    >
                      {candidate.party.abbreviation}
                    </span>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      value={results[candidate.id] || 0}
                      onChange={(e) =>
                        handleVoteChange(candidate.id, e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center transition-all"
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        {currentCandidates.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Votes:</span>
            <span className="text-2xl font-bold text-blue-600">
              {totalVotes.toLocaleString()}
            </span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !selectedStation ||
            totalVotes === 0 ||
            currentCandidates.length === 0
          }
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit {selectedElectionType} Results
            </>
          )}
        </button>
      </form>
    </div>
  );
}
