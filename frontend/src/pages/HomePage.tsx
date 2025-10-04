import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Vote,
  TrendingUp,
  Users,
  MapPin,
  ArrowRight,
  BarChart3,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";
import logoImage from "../assets/Election_hub.png";
import { getPresidentialResults } from "../services/api";

export default function HomePage() {
  const [liveStats, setLiveStats] = useState({
    totalVotes: 0,
    reportingStations: 0,
    totalStations: 0,
    isLive: false,
  });
  const [loading, setLoading] = useState(true);

  // Fetch real stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPresidentialResults();
        if (data.nationalStats) {
          setLiveStats({
            totalVotes: data.nationalStats.totalVotes,
            reportingStations: data.nationalStats.reportingStations,
            totalStations: data.nationalStats.totalStations,
            isLive: true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: <Vote className="w-8 h-8" />,
      title: "Presidential Results",
      description:
        "Track real-time presidential election results across all regions",
      link: "/results/presidential",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Parliamentary Data",
      description:
        "Comprehensive parliamentary election statistics and insights",
      link: "/results/parliamentary",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Regional Breakdown",
      description: "Detailed regional analysis and voting patterns",
      link: "/results/regions",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const trustIndicators = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verified Data",
      description: "Official sources only",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-Time Updates",
      description: "Live result tracking",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Transparent",
      description: "Full audit trail",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16 space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={logoImage}
              alt="Election Hub Logo"
              className="h-24 sm:h-32 w-auto"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
            Election Hub
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Where Democracy Meets Precision
          </p>

          <p className="text-base sm:text-lg text-gray-500 max-w-3xl mx-auto px-4">
            Your trusted source for real-time election results, comprehensive
            analytics, and transparent democratic data across Ghana.
          </p>

          {/* Live Indicator */}
          {liveStats.isLive && (
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Live Results Available
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/results/presidential"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              View Live Results
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all border-2 border-blue-600"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {loading ? (
            // Loading skeleton
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-md animate-pulse"
              >
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-blue-600">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {liveStats.totalVotes.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Total Votes Counted
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-blue-600">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {liveStats.totalStations.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Polling Stations
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="text-blue-600">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {liveStats.reportingStations} / {liveStats.totalStations}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Stations Reporting
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              to={feature.link}
              className="group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100"
            >
              <div
                className={`inline-flex p-3 sm:p-4 rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>

              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {feature.description}
              </p>

              <div className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                Explore
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {trustIndicators.map((indicator, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
            >
              <div className="text-blue-600 flex-shrink-0">
                {indicator.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                  {indicator.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600">
                  {indicator.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 md:p-12 text-white shadow-xl">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Transparent. Accurate. Real-Time.
            </h2>
            <p className="text-blue-100 text-sm sm:text-base md:text-lg">
              Election Hub provides verified election data with complete
              transparency. Our platform aggregates results from official
              sources to ensure accuracy and reliability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
              >
                Officer Login
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/results/presidential"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-all"
              >
                View Public Results
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
