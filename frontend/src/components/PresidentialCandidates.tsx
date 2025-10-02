import { useEffect, useState } from "react";
import { getPresidentialCandidates } from "../services/candidates";
import type { Candidate } from "../types";

export default function PresidentialCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPresidentialCandidates()
      .then(setCandidates)
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading candidates...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Presidential Candidates</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {candidates.map((c) => (
          <div
            key={c.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{c.name}</h3>
            <p
              className="mt-2 px-2 py-1 inline-block rounded"
              style={{ backgroundColor: c.party.color, color: "#fff" }}
            >
              {c.party.abbreviation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
