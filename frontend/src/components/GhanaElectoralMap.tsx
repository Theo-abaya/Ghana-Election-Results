import { useState, useEffect, useMemo } from "react";

interface Region {
  name: string;
  constituencies: number;
  pollingStations: number;
  totalVotes: number;
}

interface GhanaMapProps {
  regions?: Region[];
  onRegionClick?: (regionName: string) => void;
  geoJsonUrl?: string; // URL or path to your GeoJSON file
}

export default function GhanaElectoralMap({
  regions = [],
  onRegionClick,
  geoJsonUrl = "/ghana-regions.geojson", // Default path - adjust as needed
}: GhanaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load GeoJSON file
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(geoJsonUrl);

        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.statusText}`);
        }

        const data = await response.json();
        setGeoData(data);
      } catch (err: any) {
        console.error("Error loading GeoJSON:", err);
        setError(err.message || "Failed to load map data");
      } finally {
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, [geoJsonUrl]);

  // Convert GeoJSON coordinates to SVG path
  const geoToSVG = (
    coordinates: any,
    bounds: any,
    isMultiPolygon = false
  ): string => {
    if (isMultiPolygon) {
      // Handle MultiPolygon: coordinates[i][0] is outer ring of each polygon
      return coordinates
        .map((polygon: any) => geoToSVGSingle(polygon[0], bounds))
        .join(" ");
    }
    // Handle Polygon: coordinates[0] is outer ring
    return geoToSVGSingle(coordinates[0], bounds);
  };

  const geoToSVGSingle = (coordinates: any, bounds: any): string => {
    const xScale = 600 / (bounds.maxLng - bounds.minLng);
    const yScale = 700 / (bounds.maxLat - bounds.minLat);

    const points = coordinates.map(([lng, lat]: number[]) => {
      const x = (lng - bounds.minLng) * xScale;
      const y = 700 - (lat - bounds.minLat) * yScale; // Flip Y axis
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")} Z`;
  };

  // Calculate bounds for projection
  const bounds = useMemo(() => {
    if (!geoData) return null;

    let minLng = Infinity,
      maxLng = -Infinity;
    let minLat = Infinity,
      maxLat = -Infinity;

    geoData.features.forEach((feature: any) => {
      const geometry = feature.geometry;

      if (geometry.type === "Polygon") {
        // Polygon: coordinates is [[[lng, lat], ...]]
        const rings = geometry.coordinates as number[][][];
        rings.forEach((ring: number[][]) => {
          ring.forEach(([lng, lat]: number[]) => {
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          });
        });
      } else if (geometry.type === "MultiPolygon") {
        // MultiPolygon: coordinates is [[[[lng, lat], ...]], ...]
        const polygons = geometry.coordinates as number[][][][];
        polygons.forEach((polygon: number[][][]) => {
          polygon.forEach((ring: number[][]) => {
            ring.forEach(([lng, lat]: number[]) => {
              minLng = Math.min(minLng, lng);
              maxLng = Math.max(maxLng, lng);
              minLat = Math.min(minLat, lat);
              maxLat = Math.max(maxLat, lat);
            });
          });
        });
      }
    });

    // Add padding
    const padX = (maxLng - minLng) * 0.02;
    const padY = (maxLat - minLat) * 0.02;

    return {
      minLng: minLng - padX,
      maxLng: maxLng + padX,
      minLat: minLat - padY,
      maxLat: maxLat + padY,
    };
  }, [geoData]);

  // Normalize region names for matching
  const normalizeRegionName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/\s+region$/i, "") // Remove "Region" suffix
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  };

  // Find region data by normalized name
  const findRegionData = (mapRegionName: string) => {
    return regions.find(
      (r) => normalizeRegionName(r.name) === normalizeRegionName(mapRegionName)
    );
  };

  // Calculate color based on vote totals
  const getRegionColor = (regionName: string) => {
    const region = findRegionData(regionName);
    if (!region || !region.totalVotes) return "#E5E7EB";

    const maxVotes = Math.max(...regions.map((r) => r.totalVotes || 0));
    const intensity = maxVotes > 0 ? region.totalVotes / maxVotes : 0;

    const baseHue = 270;
    const saturation = 60 + intensity * 40;
    const lightness = 80 - intensity * 50;

    if (hoveredRegion === regionName) {
      return `hsl(${baseHue}, ${saturation + 10}%, ${lightness - 10}%)`;
    }

    return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`;
  };

  // Calculate centroid for labels
  const getCentroid = (coordinates: any, isMultiPolygon = false) => {
    if (!bounds) return { x: 0, y: 0 };

    let sumX = 0,
      sumY = 0,
      count = 0;

    const processRing = (ring: any) => {
      ring.forEach(([lng, lat]: number[]) => {
        const xScale = 600 / (bounds.maxLng - bounds.minLng);
        const yScale = 700 / (bounds.maxLat - bounds.minLat);
        sumX += (lng - bounds.minLng) * xScale;
        sumY += 700 - (lat - bounds.minLat) * yScale;
        count++;
      });
    };

    if (isMultiPolygon) {
      // MultiPolygon: use outer ring of each polygon
      coordinates.forEach((polygon: any) => {
        processRing(polygon[0]);
      });
    } else {
      // Polygon: use outer ring
      processRing(coordinates[0]);
    }

    return {
      x: sumX / count,
      y: sumY / count,
    };
  };

  const handleRegionMouseEnter = (
    regionName: string,
    event: React.MouseEvent
  ) => {
    setHoveredRegion(regionName);
    updateTooltipPosition(event);
  };

  const handleRegionMouseMove = (event: React.MouseEvent) => {
    updateTooltipPosition(event);
  };

  const updateTooltipPosition = (event: React.MouseEvent) => {
    const isMobile = window.innerWidth < 640;
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY - (isMobile ? 80 : 100),
    });
  };

  const handleRegionMouseLeave = () => {
    setHoveredRegion(null);
  };

  const handleRegionClick = (regionName: string) => {
    const region = findRegionData(regionName);
    if (region && onRegionClick) {
      onRegionClick(region.name);
    }
  };

  const hoveredData = hoveredRegion ? findRegionData(hoveredRegion) : null;

  // Loading state
  if (loading) {
    return (
      <div className="relative w-full">
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-200 animate-pulse">
          <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 font-medium">Loading map...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !geoData || !bounds) {
    return (
      <div className="relative w-full">
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="text-center">
            <div className="text-red-600 text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-red-800 mb-2">
              Map Loading Error
            </h3>
            <p className="text-red-600 text-sm mb-4">
              {error || "Failed to load GeoJSON data"}
            </p>
            <p className="text-xs text-gray-600">
              Make sure your GeoJSON file is available at:{" "}
              <code className="bg-red-100 px-2 py-1 rounded">{geoJsonUrl}</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Map Container */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 shadow-inner">
        <svg
          viewBox="0 0 600 700"
          className="w-full h-auto mx-auto"
          style={{ maxHeight: "600px" }}
        >
          {/* Render all regions */}
          {geoData.features.map((feature: any, idx: number) => {
            // Extract region name from properties
            const regionName =
              feature.properties.shapeName ||
              feature.properties.name ||
              feature.properties.NAME ||
              feature.properties.REGION ||
              feature.properties.region ||
              `Region ${idx + 1}`;

            const geometry = feature.geometry;
            const isMultiPolygon = geometry.type === "MultiPolygon";

            let path = "";
            if (geometry.type === "Polygon") {
              path = geoToSVG(geometry.coordinates, bounds, false);
            } else if (isMultiPolygon) {
              path = geoToSVG(geometry.coordinates, bounds, true);
            }

            const centroid = getCentroid(
              isMultiPolygon ? geometry.coordinates : geometry.coordinates,
              isMultiPolygon
            );

            return (
              <g key={`${regionName}-${idx}`}>
                <path
                  d={path}
                  fill={getRegionColor(regionName)}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer transition-all duration-300 hover:opacity-95"
                  style={{
                    filter:
                      hoveredRegion === regionName
                        ? "brightness(1.15) drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                        : "none",
                    strokeWidth: hoveredRegion === regionName ? "3.5" : "2.5",
                    stroke:
                      hoveredRegion === regionName ? "#7C3AED" : "#ffffff",
                  }}
                  onMouseEnter={(e) => handleRegionMouseEnter(regionName, e)}
                  onMouseMove={handleRegionMouseMove}
                  onMouseLeave={handleRegionMouseLeave}
                  onClick={() => handleRegionClick(regionName)}
                />
                {/* Region label */}
                <text
                  x={centroid.x}
                  y={centroid.y}
                  textAnchor="middle"
                  className="text-[9px] sm:text-[11px] font-bold pointer-events-none select-none"
                  fill={hoveredRegion === regionName ? "#581C87" : "#374151"}
                  style={{
                    textShadow:
                      "0 1px 3px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,0.5)",
                    paintOrder: "stroke fill",
                    stroke: "white",
                    strokeWidth: "3px",
                    strokeLinejoin: "round",
                  }}
                >
                  {regionName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip */}
      {hoveredRegion && hoveredData && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-2xl border-2 border-purple-300 p-3 sm:p-4 pointer-events-none animate-fadeIn"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: "translate(-50%, 0)",
            maxWidth: "280px",
          }}
        >
          <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base border-b border-purple-100 pb-2">
            {hoveredRegion}
          </h3>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between gap-4 items-center">
              <span className="text-gray-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                Total Votes:
              </span>
              <span className="font-bold text-purple-600 text-base">
                {hoveredData.totalVotes.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Constituencies:</span>
              <span className="font-semibold text-gray-900">
                {hoveredData.constituencies}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Polling Stations:</span>
              <span className="font-semibold text-gray-900">
                {hoveredData.pollingStations.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-purple-100">
            <p className="text-xs text-purple-600 font-semibold text-center animate-pulse">
              Click to view detailed results →
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-purple-600 rounded"></span>
          Vote Intensity Scale
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-medium">Low</span>
          <div className="flex-1 h-8 rounded-lg bg-gradient-to-r from-purple-100 via-purple-400 to-purple-700 shadow-inner"></div>
          <span className="text-xs text-gray-600 font-medium">High</span>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center leading-relaxed">
          Darker purple indicates higher vote totals. Hover over regions for
          details.
        </p>
      </div>

      {/* Mobile instruction */}
      <div className="mt-3 sm:hidden text-center">
        <p className="text-xs text-purple-600 font-medium bg-purple-50 rounded-lg py-2 px-4 inline-block">
          👆 Tap any region to view detailed results
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
