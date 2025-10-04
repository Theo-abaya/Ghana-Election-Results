import { useState, useEffect } from "react";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { getAllConstituencies } from "../services/api";
import type { Constituency } from "../types";

interface ConstituencySelectorProps {
  onSelect: (constituencyId: string) => void;
}

export default function ConstituencySelector({
  onSelect,
}: ConstituencySelectorProps) {
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [filteredConstituencies, setFilteredConstituencies] = useState<
    Constituency[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConstituency, setSelectedConstituency] =
    useState<Constituency | null>(null);

  const regions = [
    "All Regions",
    "Greater Accra",
    "Ashanti",
    "Eastern",
    "Central",
    "Western",
    "Volta",
    "Northern",
    "Upper East",
    "Upper West",
    "Bono",
    "Bono East",
    "Ahafo",
    "Western North",
    "Savannah",
    "North East",
    "Oti",
  ];

  useEffect(() => {
    // Fetch all constituencies
    getAllConstituencies()
      .then((data) => {
        setConstituencies(data);
        setFilteredConstituencies(data);
      })
      .catch((error) => console.error("Error fetching constituencies:", error));
  }, []);

  useEffect(() => {
    let filtered = constituencies;

    // Filter by region
    if (selectedRegion !== "all") {
      filtered = filtered.filter((c) => c.region === selectedRegion);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConstituencies(filtered);
  }, [searchTerm, selectedRegion, constituencies]);

  const handleSelect = (constituency: Constituency) => {
    setSelectedConstituency(constituency);
    setIsOpen(false);
    setSearchTerm("");
    onSelect(constituency.id);
  };

  return (
    <div className="relative">
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between hover:border-blue-500 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">
            {selectedConstituency
              ? selectedConstituency.name
              : "Select a Constituency"}
          </span>
          {selectedConstituency && (
            <span className="text-sm text-gray-500">
              ({selectedConstituency.region})
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-hidden">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search constituency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {regions.map((region, idx) => (
                <option key={idx} value={idx === 0 ? "all" : region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Constituencies List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredConstituencies.length > 0 ? (
              filteredConstituencies.map((constituency) => (
                <button
                  key={constituency.id}
                  onClick={() => handleSelect(constituency)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {constituency.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {constituency.region}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No constituencies found</p>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 text-center">
            Showing {filteredConstituencies.length} of {constituencies.length}{" "}
            constituencies
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
