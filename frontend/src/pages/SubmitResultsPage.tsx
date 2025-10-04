import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Send } from "lucide-react";
import {
  getAllPollingStations,
  getPresidentialCandidates,
  submitResult,
} from "../services/api";
import { showToast } from "../utils/toast";

interface PollingStation {
  id: string;
  name: string;
  code: string;
  constituency: { name: string };
}

interface Candidate {
  id: string;
  name: string;
  party: { name: string; abbreviation: string; color: string };
}

export default function SubmitResultsPage() {
  const [pollingStations, setPollingStations] = useState<PollingStation[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [results, setResults] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stations, cands] = await Promise.all([
        getAllPollingStations(),
        getPresidentialCandidates(),
      ]);
      setPollingStations(stations);
      setCandidates(cands);

      // Initialize results object
      const initialResults: Record<string, number> = {};
      cands.forEach((c: Candidate) => {
        initialResults[c.id] = 0;
      });
      setResults(initialResults);
    } catch (err) {
      console.error("Error fetching data:", err);
      showToast.error("Failed to load polling stations and candidates");
    }
  };

  const handleVoteChange = (candidateId: string, votes: string) => {
    const numVotes = parseInt(votes) || 0;
    setResults((prev) => ({ ...prev, [candidateId]: numVotes }));
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

    if (totalVotes === 0) {
      setError("Please enter at least one vote");
      showToast.warning("Please enter vote counts for at least one candidate");
      return;
    }

    setIsSubmitting(true);

    // Show loading toast
    const loadingToast = showToast.loading("Submitting results...");

    try {
      // Submit results for each candidate
      for (const candidateId in results) {
        if (results[candidateId] > 0) {
          await submitResult({
            pollingStationId: selectedStation,
            candidateId,
            votes: results[candidateId],
          });
        }
      }

      // Dismiss loading toast
      showToast.dismiss(loadingToast);

      // Show success toast
      const selectedStationName = pollingStations.find(
        (s) => s.id === selectedStation
      )?.name;
      showToast.success(
        `Results for ${selectedStationName} submitted successfully!`
      );

      setSuccess(true);

      // Reset form
      const initialResults: Record<string, number> = {};
      candidates.forEach((c) => {
        initialResults[c.id] = 0;
      });
      setResults(initialResults);
      setSelectedStation("");

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      // Dismiss loading toast
      showToast.dismiss(loadingToast);

      const errorMessage =
        err.response?.data?.message || "Failed to submit results";
      setError(errorMessage);

      // Show error toast
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVotes = Object.values(results).reduce(
    (sum, votes) => sum + votes,
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
              Your polling station results have been recorded.
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

        {/* Vote Entry */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Presidential Candidates
          </h3>
          <div className="space-y-4">
            {candidates.map((candidate) => (
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
                    value={results[candidate.id]}
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
        </div>

        {/* Total */}
        <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total Votes:</span>
          <span className="text-2xl font-bold text-blue-600">
            {totalVotes.toLocaleString()}
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedStation || totalVotes === 0}
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
              Submit Results
            </>
          )}
        </button>
      </form>
    </div>
  );
}
