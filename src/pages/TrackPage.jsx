import { useState } from "react";
import { Link } from "react-router-dom";
import { ImmigrationApplication } from "@/api/entities";
import { Search, Clock, CheckCircle, XCircle, FileText, AlertCircle } from "lucide-react";

const statusConfig = {
  Draft: { color: "bg-gray-100 text-gray-600", icon: <FileText className="w-5 h-5" />, label: "Draft" },
  Submitted: { color: "bg-blue-100 text-blue-700", icon: <Clock className="w-5 h-5" />, label: "Submitted" },
  "Under Review": { color: "bg-yellow-100 text-yellow-700", icon: <AlertCircle className="w-5 h-5" />, label: "Under Review" },
  Approved: { color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-5 h-5" />, label: "Approved ✓" },
  Rejected: { color: "bg-red-100 text-red-700", icon: <XCircle className="w-5 h-5" />, label: "Rejected" },
};

export default function TrackPage() {
  const [refInput, setRefInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!refInput.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const apps = await ImmigrationApplication.filter({ reference_number: refInput.trim().toUpperCase() });
      if (apps && apps.length > 0) {
        setResult(apps[0]);
      } else {
        setNotFound(true);
      }
    } catch (e) {
      setNotFound(true);
    }
    setLoading(false);
  };

  const status = result ? statusConfig[result.status] || statusConfig["Submitted"] : null;

  const timeline = [
    { label: "Application Submitted", done: true },
    { label: "Under Review", done: result?.status === "Under Review" || result?.status === "Approved" || result?.status === "Rejected" },
    { label: "Decision Made", done: result?.status === "Approved" || result?.status === "Rejected" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003366] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span>🇺🇸🇨🇦</span>
            <span className="font-bold">Immigration Portal</span>
          </Link>
          <span className="text-blue-200 text-sm">Application Tracker</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Track Your Application</h2>
          <p className="text-gray-500">Enter your reference number to check the status of your immigration application.</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Number</label>
          <div className="flex gap-3">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#003366] uppercase"
              placeholder="e.g. IAP-ABC123XYZ"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !refInput.trim()}
              className="bg-[#003366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004a99] transition disabled:opacity-40 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? "..." : "Search"}
            </button>
          </div>
        </div>

        {/* Not Found */}
        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="font-semibold text-red-700">Application Not Found</p>
            <p className="text-red-500 text-sm mt-1">Please check your reference number and try again.</p>
          </div>
        )}

        {/* Result */}
        {result && status && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Reference Number</p>
                <p className="text-xl font-mono font-bold text-[#003366]">{result.reference_number}</p>
              </div>
              <span className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${status.color}`}>
                {status.icon} {status.label}
              </span>
            </div>

            {/* Applicant Info */}
            <div className="border-t border-gray-100 pt-5 mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Applicant Name</p>
                <p className="font-semibold text-gray-800">{result.full_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Destination</p>
                <p className="font-semibold text-gray-800">
                  {result.destination_country === "USA" ? "🇺🇸" : "🇨🇦"} {result.destination_country}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Visa Type</p>
                <p className="font-semibold text-gray-800">{result.visa_type}</p>
              </div>
              <div>
                <p className="text-gray-500">Nationality</p>
                <p className="font-semibold text-gray-800">{result.nationality}</p>
              </div>
              <div>
                <p className="text-gray-500">Submitted On</p>
                <p className="font-semibold text-gray-800">
                  {new Date(result.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Application Timeline</p>
              <div className="flex flex-col gap-3">
                {timeline.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${t.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                      {t.done ? "✓" : i + 1}
                    </div>
                    <span className={`text-sm ${t.done ? "text-gray-800 font-medium" : "text-gray-400"}`}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {result.status === "Approved" && (
              <div className="mt-5 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                🎉 Congratulations! Your application has been approved. Please check your email for further instructions.
              </div>
            )}
            {result.status === "Rejected" && (
              <div className="mt-5 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                Your application was not approved at this time. Please consult an immigration attorney for assistance.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
