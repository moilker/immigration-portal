import { useState } from "react";
import { Link } from "react-router-dom";
import { ImmigrationApplication } from "@/api/entities";
import { CheckCircle, ChevronRight, ChevronLeft, Loader } from "lucide-react";

const steps = ["Destination", "Personal Info", "Passport & Contact", "Background", "Review & Submit"];

const countries = ["USA", "Canada"];
const visaTypes = ["Tourist/Visitor", "Student", "Work Permit", "Permanent Residence", "Family Sponsorship", "Refugee/Asylum", "Business"];
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];
const educationLevels = ["High School", "Bachelor's", "Master's", "PhD", "Other"];
const employmentStatuses = ["Employed", "Self-Employed", "Student", "Unemployed"];
const nationalities = [
  "Afghan","Albanian","Algerian","American","Argentinian","Australian","Bangladeshi","Brazilian","British",
  "Canadian","Chinese","Colombian","Egyptian","Ethiopian","French","German","Ghanaian","Indian","Indonesian",
  "Iranian","Iraqi","Italian","Jamaican","Japanese","Jordanian","Kenyan","Lebanese","Libyan","Malaysian",
  "Mexican","Moroccan","Nigerian","Pakistani","Palestinian","Peruvian","Philippine","Russian","Saudi","Senegalese",
  "Somali","South African","Spanish","Sri Lankan","Sudanese","Syrian","Tanzanian","Tunisian","Turkish",
  "Ugandan","Ukrainian","Venezuelan","Vietnamese","Yemeni","Zimbabwean","Other"
];

function generateRef() {
  return "IAP-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

export default function ApplyPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [form, setForm] = useState({
    destination_country: "",
    visa_type: "",
    full_name: "",
    date_of_birth: "",
    nationality: "",
    marital_status: "",
    education_level: "",
    employment_status: "",
    passport_number: "",
    email: "",
    phone: "",
    have_criminal_record: false,
    previously_refused_visa: false,
    additional_notes: "",
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    const ref = generateRef();
    try {
      await ImmigrationApplication.create({
        ...form,
        status: "Submitted",
        reference_number: ref,
      });
      setRefNumber(ref);
      setSubmitted(true);
    } catch (e) {
      alert("Error submitting application. Please try again.");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">Your immigration application has been successfully received.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <p className="text-sm text-gray-500 mb-1">Your Reference Number</p>
            <p className="text-3xl font-mono font-bold text-[#003366]">{refNumber}</p>
            <p className="text-xs text-gray-400 mt-2">Save this number to track your application status</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/track" className="bg-[#003366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004a99] transition">
              Track Application
            </Link>
            <Link to="/" className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003366] text-white px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span>🇺🇸🇨🇦</span>
            <span className="font-bold">Immigration Portal</span>
          </Link>
          <span className="text-blue-200 text-sm">Secure Application Form</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-[#003366] z-0 transition-all duration-500"
              style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    i < step
                      ? "bg-[#003366] border-[#003366] text-white"
                      : i === step
                      ? "bg-white border-[#003366] text-[#003366]"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden md:block ${i === step ? "text-[#003366] font-semibold" : "text-gray-400"}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-4 md:hidden">
            Step {step + 1} of {steps.length}: <span className="font-semibold text-[#003366]">{steps[step]}</span>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 0: Destination */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Select Destination Country & Visa Type</h2>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Destination Country *</label>
                <div className="grid grid-cols-2 gap-4">
                  {countries.map((c) => (
                    <button
                      key={c}
                      onClick={() => update("destination_country", c)}
                      className={`p-6 border-2 rounded-xl text-center font-bold text-lg transition ${
                        form.destination_country === c
                          ? "border-[#003366] bg-blue-50 text-[#003366]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {c === "USA" ? "🇺🇸" : "🇨🇦"}
                      <br />
                      {c === "USA" ? "United States" : "Canada"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Visa / Immigration Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {visaTypes.map((v) => (
                    <button
                      key={v}
                      onClick={() => update("visa_type", v)}
                      className={`p-3 border-2 rounded-lg text-sm font-medium text-left transition ${
                        form.visa_type === v
                          ? "border-[#003366] bg-blue-50 text-[#003366]"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>
              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name (as on passport) *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    placeholder="John Michael Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    value={form.date_of_birth}
                    onChange={(e) => update("date_of_birth", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nationality *</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    value={form.nationality}
                    onChange={(e) => update("nationality", e.target.value)}
                  >
                    <option value="">Select nationality...</option>
                    {nationalities.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Marital Status</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                      value={form.marital_status}
                      onChange={(e) => update("marital_status", e.target.value)}
                    >
                      <option value="">Select...</option>
                      {maritalStatuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Education Level</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                      value={form.education_level}
                      onChange={(e) => update("education_level", e.target.value)}
                    >
                      <option value="">Select...</option>
                      {educationLevels.map((e) => <option key={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Employment Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    value={form.employment_status}
                    onChange={(e) => update("employment_status", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {employmentStatuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Passport & Contact */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Passport & Contact Details</h2>
              <div className="grid gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Passport Number *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366] font-mono"
                    value={form.passport_number}
                    onChange={(e) => update("passport_number", e.target.value.toUpperCase())}
                    placeholder="A12345678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+1 555 000 0000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Background */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Background Information</h2>
              <p className="text-sm text-gray-500 mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                ⚠️ Please answer all questions truthfully. Providing false information may result in application rejection or legal consequences.
              </p>
              <div className="grid gap-6">
                <div className="border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold text-gray-800 mb-3">Do you have any criminal record in any country?</p>
                  <div className="flex gap-4">
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        onClick={() => update("have_criminal_record", v)}
                        className={`flex-1 py-3 rounded-lg border-2 font-medium transition ${
                          form.have_criminal_record === v
                            ? "border-[#003366] bg-blue-50 text-[#003366]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {v ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border border-gray-200 rounded-xl p-5">
                  <p className="font-semibold text-gray-800 mb-3">Have you ever been refused a visa or entry to any country?</p>
                  <div className="flex gap-4">
                    {[true, false].map((v) => (
                      <button
                        key={String(v)}
                        onClick={() => update("previously_refused_visa", v)}
                        className={`flex-1 py-3 rounded-lg border-2 font-medium transition ${
                          form.previously_refused_visa === v
                            ? "border-[#003366] bg-blue-50 text-[#003366]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {v ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Notes / Special Circumstances</label>
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                    value={form.additional_notes}
                    onChange={(e) => update("additional_notes", e.target.value)}
                    placeholder="Add any relevant information here..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Review & Submit</h2>
              <div className="space-y-4 text-sm">
                {[
                  ["Destination", `${form.destination_country} — ${form.visa_type}`],
                  ["Full Name", form.full_name],
                  ["Date of Birth", form.date_of_birth],
                  ["Nationality", form.nationality],
                  ["Passport Number", form.passport_number],
                  ["Email", form.email],
                  ["Phone", form.phone],
                  ["Marital Status", form.marital_status],
                  ["Education", form.education_level],
                  ["Employment", form.employment_status],
                  ["Criminal Record", form.have_criminal_record ? "Yes" : "No"],
                  ["Previously Refused", form.previously_refused_visa ? "Yes" : "No"],
                  ...(form.additional_notes ? [["Notes", form.additional_notes]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-4 py-2 border-b border-gray-100">
                    <span className="text-gray-500 w-40 shrink-0">{label}</span>
                    <span className="font-medium text-gray-800">{value || "—"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                By submitting this application, you confirm that all information provided is accurate and truthful.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 text-gray-600 border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <Link to="/" className="text-gray-500 px-5 py-2.5 hover:text-gray-700 transition">← Home</Link>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 0 && (!form.destination_country || !form.visa_type)) ||
                  (step === 1 && (!form.full_name || !form.date_of_birth || !form.nationality)) ||
                  (step === 2 && (!form.passport_number || !form.email))
                }
                className="flex items-center gap-2 bg-[#003366] text-white px-6 py-2.5 rounded-lg hover:bg-[#004a99] transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 transition font-bold"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
