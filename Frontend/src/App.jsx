import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

// PAGES
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Apply from "./pages/Apply";
import AptitudeRound from "./pages/AptitudeRound";
import TechnicalRound from "./pages/TechnicalRound";
import CodingRound from "./pages/CodingRound";
import HRRound from "./pages/HRRound";
import SelectedCandidates from "./pages/SelectedCandidates";
import Test from "./pages/Test";
import Progress from "./pages/Progress";

const Analytics = () => (
  <div className="p-6 text-xl text-white">📊 Analytics Page</div>
);

export default function App() {
  return (
    <BrowserRouter>

      {/* 🔥 MAIN LAYOUT */}
      <div className="flex h-screen bg-[#0B0F17] text-white">

        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto">

          <Routes>

            {/* ================= DASHBOARD ================= */}
            <Route path="/" element={<Dashboard />} />

            {/* ================= RESUME ================= */}
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/apply" element={<Apply />} />

            {/* ================= PROGRESS ================= */}
            <Route path="/progress" element={<Progress />} />

            {/* ================= ROUNDS ================= */}
            <Route path="/aptitude" element={<AptitudeRound />} />
            <Route path="/technical" element={<TechnicalRound />} />
            <Route path="/coding" element={<CodingRound />} />
            <Route path="/hr-round" element={<HRRound />} />

            {/* ================= TEST ================= */}
            <Route path="/test/:domain" element={<Test />} />

            {/* ================= EXTRA ================= */}
            <Route path="/selected" element={<SelectedCandidates />} />
            <Route path="/analytics" element={<Analytics />} />

          </Routes>

        </div>

      </div>

    </BrowserRouter>
  );
}