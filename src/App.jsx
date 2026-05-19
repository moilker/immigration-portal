import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ApplyPage from "./pages/ApplyPage";
import TrackPage from "./pages/TrackPage";
import AdminPage from "./pages/AdminPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import PaymentPage from "./pages/PaymentPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/track" element={<TrackPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
