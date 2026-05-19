import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ImmigrationApplication } from "@/api/entities";
import { Users, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter } from "lucide-react";

const statusColors = {
  Draft: "bg-gray-100 text-gray-600",
  Submitted: "bg-blue-100 text-blue-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const statusOptions = ["All", "Draft", "Submitted", "Under Review", "Approved", "Rejected"];

export default function AdminPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      const data = await ImmigrationApplication.list();
      setApps(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await ImmigrationApplication.update(id, { status: newStatus });
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    } catch (e) {
      alert("Failed to update status");
    }
    setUpdating(null);
  };

  const filtered = apps.filter((a) => {
    const matchSearch =
      !search ||
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    const matchCountry = filterCountry === "All" || a.destination_country === filterCountry;
    return matchSearch && matchStatus && matchCountry;
  });

  const stats = {
    total: apps.length,
    submitted: apps.filter((a) => a.status === "Submitted").length,
    review: apps.filter((a) => a.status === "Under Review").length,
    approved: apps.filter((a) => a.status === "Approved").length,
    rejected: apps.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#003366] text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span>🇺🇸🇨🇦</span>
            <span className="font-bold">Immigration Portal</span>
          </Link>
          <span className="text-blue-200 text-sm font-semibold">Admin Dashboard</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Application Management</h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, icon: <Users className="w-5 h-5" />, color: "text-gray-700" },
            { label: "Submitted", value: stats.submitted, icon: <Clock className="w-5 h-5 text-blue-500" />, color: "text-blue-700" },
            { label: "Under Review", value: stats.review, icon: <AlertCircle className="w-5 h-5 text-yellow-500" />, color: "text-yellow-700" },
            { label: "Approved", value: stats.approved, icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "text-green-700" },
            { label: "Rejected", value: stats.rejected, icon: <XCircle className="w-5 h-5 text-red-500" />, color: "text-red-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-400">{s.icon}<span className="text-xs">{s.label}</span></div>
              <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              placeholder="Search by name, email, or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
            >
              <option>All</option>
              <option>USA</option>
              <option>Canada</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading applications...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No applications found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Reference", "Applicant", "Country", "Visa Type", "Nationality", "Status", "Submitted", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app) => (
                    <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-[#003366] font-bold">{app.reference_number}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{app.full_name}</div>
                        <div className="text-gray-400 text-xs">{app.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        {app.destination_country === "USA" ? "🇺🇸 USA" : "🇨🇦 Canada"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{app.visa_type}</td>
                      <td className="px-4 py-3 text-gray-600">{app.nationality}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[app.status] || "bg-gray-100 text-gray-600"}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(app.created_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#003366]"
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          disabled={updating === app.id}
                        >
                          {["Submitted", "Under Review", "Approved", "Rejected"].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
