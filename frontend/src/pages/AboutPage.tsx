import { Shield, Zap, Eye, Users } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Transparency",
      description:
        "All election data is sourced from official channels and displayed with complete transparency.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-Time Updates",
      description:
        "Get instant updates as results are verified and published by electoral authorities.",
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Accuracy",
      description:
        "We ensure data accuracy through multiple verification layers and official source validation.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Accessibility",
      description:
        "Making democratic data accessible to everyone, from researchers to everyday citizens.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Election Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted platform for comprehensive, real-time election results
            and analysis
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Election Hub was created to provide Ghanaians and the global
            community with transparent, accurate, and real-time access to
            election data. We believe that democracy thrives when information is
            freely accessible and verifiable.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our platform aggregates official election results and presents them
            in an easy-to-understand format, empowering citizens, journalists,
            researchers, and stakeholders to make informed decisions based on
            factual data.
          </p>
        </div>

        {/* Core Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="text-blue-600 mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What We Offer */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-3xl font-bold mb-6">What We Offer</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-300 mt-2"></div>
              <p className="text-lg text-blue-50">
                <strong className="text-white">
                  Presidential Election Results:
                </strong>{" "}
                Comprehensive data on all presidential candidates with regional
                breakdowns
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-300 mt-2"></div>
              <p className="text-lg text-blue-50">
                <strong className="text-white">Parliamentary Data:</strong>{" "}
                Complete parliamentary election statistics across all
                constituencies
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-300 mt-2"></div>
              <p className="text-lg text-blue-50">
                <strong className="text-white">Regional Analysis:</strong>{" "}
                Detailed regional voting patterns and demographic insights
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-300 mt-2"></div>
              <p className="text-lg text-blue-50">
                <strong className="text-white">Live Updates:</strong> Real-time
                result updates as they are verified by electoral authorities
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 mb-6">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
}
