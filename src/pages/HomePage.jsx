import { Link } from "react-router-dom";
import { Shield, Globe, FileText, Clock, CheckCircle, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="text-2xl">🇺🇸</span>
              <span className="text-2xl">🇨🇦</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Immigration Application Portal</h1>
              <p className="text-xs text-blue-200">Official Immigration Processing System</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-blue-200 transition">Home</Link>
            <Link to="/apply" className="hover:text-blue-200 transition">Apply Now</Link>
            <Link to="/track" className="hover:text-blue-200 transition">Track Application</Link>
          </nav>
        </div>
        {/* Government bar */}
        <div className="bg-[#B22222] py-1 text-center text-xs text-white tracking-widest font-semibold">
          OFFICIAL IMMIGRATION SERVICES PORTAL — USA & CANADA
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#003366] to-[#004a99] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-4 mb-6">
            <span className="text-6xl">🇺🇸</span>
            <span className="text-6xl">🇨🇦</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Start Your Immigration Journey
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Apply for immigration to the United States or Canada. Our secure, step-by-step process guides you through your application with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/apply"
              className="bg-white text-[#003366] font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-50 transition shadow-lg"
            >
              Begin Application →
            </Link>
            <Link
              to="/track"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-white hover:text-[#003366] transition"
            >
              Track My Application
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-12">
            Why Use Our Portal?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8 text-[#003366]" />,
                title: "Secure & Confidential",
                desc: "Your personal data is encrypted and protected with industry-standard security measures.",
              },
              {
                icon: <Clock className="w-8 h-8 text-[#003366]" />,
                title: "Fast Processing",
                desc: "Submit your application in minutes. Track your status in real time.",
              },
              {
                icon: <Globe className="w-8 h-8 text-[#003366]" />,
                title: "USA & Canada",
                desc: "One portal for both countries. Choose your destination and visa type easily.",
              },
              {
                icon: <FileText className="w-8 h-8 text-[#003366]" />,
                title: "Step-by-Step Guidance",
                desc: "Our guided form ensures you never miss a required field.",
              },
              {
                icon: <CheckCircle className="w-8 h-8 text-[#003366]" />,
                title: "Real-Time Status",
                desc: "Track your application using your unique reference number anytime.",
              },
              {
                icon: <Users className="w-8 h-8 text-[#003366]" />,
                title: "All Visa Types",
                desc: "Tourist, Student, Work, PR, Family Sponsorship, Business & more.",
              },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="mb-3">{f.icon}</div>
                <h4 className="font-bold text-gray-800 mb-2">{f.title}</h4>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa Types */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-12">Available Visa Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "✈️", label: "Tourist / Visitor" },
              { emoji: "🎓", label: "Student Visa" },
              { emoji: "💼", label: "Work Permit" },
              { emoji: "🏠", label: "Permanent Residence" },
              { emoji: "👨‍👩‍👧", label: "Family Sponsorship" },
              { emoji: "🏢", label: "Business Visa" },
              { emoji: "🛡️", label: "Refugee / Asylum" },
              { emoji: "📋", label: "Other Categories" },
            ].map((v, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 text-center hover:border-[#003366] hover:bg-blue-50 transition cursor-pointer">
                <div className="text-3xl mb-2">{v.emoji}</div>
                <p className="text-sm font-medium text-gray-700">{v.label}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/apply" className="bg-[#003366] text-white font-bold px-10 py-4 rounded-lg text-lg hover:bg-[#004a99] transition inline-block">
              Apply Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Notice */}
      <div className="bg-yellow-50 border-t border-yellow-200 py-4 px-4 text-center text-sm text-yellow-800">
        ⚠️ This portal is for application processing purposes. Always consult a licensed immigration attorney for legal advice.
      </div>

      {/* Footer */}
      <footer className="bg-[#003366] text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-bold">Immigration Application Portal</p>
            <p className="text-blue-300 text-sm">Serving USA & Canada Immigration Applications</p>
          </div>
          <div className="text-blue-300 text-sm text-center">
            <p>© 2026 Immigration Portal. All rights reserved.</p>
            <p>Secure SSL Encrypted | Privacy Protected</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
