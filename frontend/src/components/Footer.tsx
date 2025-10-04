import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Mail } from "lucide-react";
import logoImage from "../assets/Election_hub.png";
import { showToast } from "../utils/toast";

export default function Footer() {
  // Handler for incomplete features
  const handleIncompleteFeature = (featureName: string) => {
    showToast.info(`${featureName} coming soon! Stay tuned for updates.`);
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoImage}
                alt="Election Hub Logo"
                className="h-14 w-auto"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Election Hub</h3>
                <p className="text-sm text-gray-400 italic">
                  Where democracy meets precision
                </p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Your trusted source for transparent, accurate, and real-time
              election results across Ghana. Empowering citizens with
              data-driven democratic insights.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleIncompleteFeature("Twitter integration")}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleIncompleteFeature("Facebook integration")}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleIncompleteFeature("Instagram integration")}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </button>
              <a
                href="mailto:info@electionhub.com"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/results/presidential"
                  className="hover:text-white transition-colors"
                >
                  Presidential Results
                </Link>
              </li>
              <li>
                <Link
                  to="/results/parliamentary"
                  className="hover:text-white transition-colors"
                >
                  Parliamentary Results
                </Link>
              </li>
              <li>
                <Link
                  to="/results/regions"
                  className="hover:text-white transition-colors"
                >
                  Regional Results
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources - With Toast Notifications for Incomplete Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleIncompleteFeature("API Documentation")}
                  className="hover:text-white transition-colors text-left"
                >
                  API Documentation
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleIncompleteFeature("Data Sources")}
                  className="hover:text-white transition-colors text-left"
                >
                  Data Sources
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleIncompleteFeature("FAQs")}
                  className="hover:text-white transition-colors text-left"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleIncompleteFeature("Privacy Policy")}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleIncompleteFeature("Terms of Service")}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Election Hub. All Rights Reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Built with ❤️ for Ghanaian Democracy
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
