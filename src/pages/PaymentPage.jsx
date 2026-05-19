import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, CreditCard, DollarSign } from "lucide-react";

const SERVICES = [
  { id: "tourist", label: "Tourist / Visitor Visa", price: 150, desc: "Full application assistance for USA or Canada tourist visa" },
  { id: "student", label: "Student Visa", price: 200, desc: "Complete student visa processing and document review" },
  { id: "work", label: "Work Permit", price: 250, desc: "Work permit application with employer letter guidance" },
  { id: "pr", label: "Permanent Residence (PR / Green Card)", price: 400, desc: "Full PR or Green Card application package" },
  { id: "family", label: "Family Sponsorship", price: 300, desc: "Family reunification and sponsorship application" },
  { id: "worldcup", label: "FIFA World Cup 2026 Visa", price: 120, desc: "Special event visa for the 2026 World Cup" },
];

export default function PaymentPage() {
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(1); // 1=select service, 2=choose method, 3=confirm
  const [method, setMethod] = useState(null);
  const [refNumber, setRefNumber] = useState("");
  const [paid, setPaid] = useState(false);

  const selectedService = SERVICES.find((s) => s.id === selected);

  const handlePayPal = () => {
    if (!selectedService) return;
    const paypalUrl = `https://www.paypal.com/paypalme/immigrationportal/${selectedService.price}USD`;
    window.open(paypalUrl, "_blank");
    setPaid(true);
  };

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
            <Link to="/payment" className="text-yellow-300 font-bold">Pay Now</Link>
          </nav>
        </div>
        <div className="bg-[#B22222] py-1 text-center text-xs text-white tracking-widest font-semibold">
          OFFICIAL IMMIGRATION SERVICES PORTAL — USA & CANADA
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-[#003366] text-white rounded-full p-4">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Service Payment</h2>
          <p className="text-gray-500">Select your service and pay securely via PayPal or Credit Card</p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-8 text-green-700 text-sm">
          <Shield className="w-4 h-4" />
          <span>Secure 256-bit SSL Encrypted Payment</span>
        </div>

        {!paid ? (
          <>
            {/* Step 1 — Select Service */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <span className="bg-[#003366] text-white rounded-full w-7 h-7 inline-flex items-center justify-center text-sm mr-2">1</span>
                Select Service
              </h3>
              <div className="grid gap-3">
                {SERVICES.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelected(s.id)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition flex justify-between items-center ${
                      selected === s.id
                        ? "border-[#003366] bg-blue-50"
                        : "border-gray-200 hover:border-[#003366] hover:bg-blue-50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{s.label}</p>
                      <p className="text-gray-500 text-sm">{s.desc}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-[#003366]">${s.price}</p>
                      <p className="text-xs text-gray-400">USD</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2 — Reference Number */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <span className="bg-[#003366] text-white rounded-full w-7 h-7 inline-flex items-center justify-center text-sm mr-2">2</span>
                Your Application Reference Number
              </h3>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. IAP-XXXXXXXX (optional)"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-[#003366]"
              />
              <p className="text-xs text-gray-400 mt-1">You can find this in your application confirmation email.</p>
            </div>

            {/* Step 3 — Payment Method */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                <span className="bg-[#003366] text-white rounded-full w-7 h-7 inline-flex items-center justify-center text-sm mr-2">3</span>
                Choose Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* PayPal */}
                <button
                  onClick={() => setMethod("paypal")}
                  className={`border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition ${
                    method === "paypal"
                      ? "border-[#003087] bg-blue-50"
                      : "border-gray-200 hover:border-[#003087]"
                  }`}
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                    alt="PayPal"
                    className="h-8 object-contain"
                  />
                  <span className="text-sm font-semibold text-gray-700">Pay with PayPal</span>
                  <span className="text-xs text-gray-400">Fast & Secure</span>
                </button>

                {/* Credit Card */}
                <button
                  onClick={() => setMethod("card")}
                  className={`border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition ${
                    method === "card"
                      ? "border-[#003366] bg-blue-50"
                      : "border-gray-200 hover:border-[#003366]"
                  }`}
                >
                  <CreditCard className="w-8 h-8 text-[#003366]" />
                  <span className="text-sm font-semibold text-gray-700">Credit / Debit Card</span>
                  <span className="text-xs text-gray-400">Visa, Mastercard, Amex</span>
                </button>
              </div>
            </div>

            {/* Summary & Pay Button */}
            {selected && method && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-gray-700 mb-3">Order Summary</h4>
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>{selectedService.label}</span>
                  <span>${selectedService.price}.00 USD</span>
                </div>
                {refNumber && (
                  <div className="flex justify-between mb-2 text-xs text-gray-400">
                    <span>Reference</span>
                    <span>{refNumber}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-[#003366] text-xl">${selectedService.price}.00 USD</span>
                </div>
              </div>
            )}

            {selected && method === "paypal" && (
              <button
                onClick={handlePayPal}
                className="w-full bg-[#003087] text-white font-bold py-4 rounded-xl text-lg hover:bg-[#002070] transition flex items-center justify-center gap-3"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                  alt="PayPal"
                  className="h-6 brightness-0 invert"
                />
                Pay ${selectedService?.price}.00 with PayPal
              </button>
            )}

            {selected && method === "card" && (
              <button
                className="w-full bg-[#003366] text-white font-bold py-4 rounded-xl text-lg hover:bg-[#004a99] transition flex items-center justify-center gap-3"
                onClick={() => alert("Credit card payment will be available soon. Please use PayPal for now.")}
              >
                <CreditCard className="w-5 h-5" />
                Pay ${selectedService?.price}.00 with Card
              </button>
            )}

            {!selected && (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 font-bold py-4 rounded-xl text-lg cursor-not-allowed"
              >
                Select a service to continue
              </button>
            )}
          </>
        ) : (
          /* Success Screen */
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Initiated! 🎉</h3>
            <p className="text-gray-500 mb-4">
              You've been redirected to PayPal to complete your payment of{" "}
              <strong>${selectedService?.price} USD</strong> for{" "}
              <strong>{selectedService?.label}</strong>.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              After payment, please email your PayPal receipt to{" "}
              <a href="mailto:naname522@gmail.com" className="text-[#003366] underline">
                naname522@gmail.com
              </a>{" "}
              with your reference number.
            </p>
            <Link
              to="/"
              className="bg-[#003366] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#004a99] transition inline-block"
            >
              ← Back to Home
            </Link>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-center text-xs text-gray-400">
          <div>🔒 SSL Secured</div>
          <div>🛡️ Data Encrypted</div>
          <div>✅ PayPal Protected</div>
          <div>📧 Receipt by Email</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#003366] text-white py-6 px-4 mt-12">
        <div className="max-w-6xl mx-auto text-center text-blue-300 text-sm">
          <p>© 2026 Immigration Portal. All rights reserved.</p>
          <p>Secure SSL Encrypted | Privacy Protected</p>
        </div>
      </footer>
    </div>
  );
}
