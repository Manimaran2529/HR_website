import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

// PAGES
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import Apply from "./pages/Apply";   // ✅ MUST IMPORT
import AptitudeRound from "./pages/AptitudeRound";
import TechnicalRound from "./pages/TechnicalRound";
import CodingRound from "./pages/CodingRound";
import HRRound from "./pages/HRRound";
import SelectedCandidates from "./pages/SelectedCandidates";


const Analytics = () => (
  <div className="p-6 text-xl">📊 Analytics Page</div>
);

export default function App() {
  return (
    <BrowserRouter>

      <div className="flex bg-[#0B0F17] text-white min-h-screen">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN */}
        <div className="flex-1 overflow-y-auto">

          <Routes>

            {/* ✅ VERY IMPORTANT */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />

            {/* 🔥 THIS IS YOUR MISSING PART */}
            <Route path="/apply" element={<Apply />} />

            {/* ROUNDS */}
            <Route path="/aptitude" element={<AptitudeRound />} />
            <Route path="/technical" element={<TechnicalRound />} />
            <Route path="/coding" element={<CodingRound />} />
            <Route path="/hr-round" element={<HRRound />} />
            <Route path="/selected" element={<SelectedCandidates />} />

            {/* REPORT */}
            <Route path="/analytics" element={<Analytics />} />

          </Routes>

        </div>

      </div>

    </BrowserRouter>
  );
}