import { useState } from "react";

export default function TechnicalRound() {

  const TOTAL_QUESTIONS = 30;

  const [domain, setDomain] = useState("ML");
  const [month, setMonth] = useState("April");
  const [cutoff, setCutoff] = useState(18);
  const [filterStatus, setFilterStatus] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");

  // 🔥 Fake Data
  const candidates = [
    { name: "John Doe", email: "john@gmail.com", domain: "ML", month: "April", correct: 24 },
    { name: "Priya Sharma", email: "priya@gmail.com", domain: "ML", month: "April", correct: 15 },
    { name: "Arun Kumar", email: "arun@gmail.com", domain: "ML", month: "April", correct: 20 },
    { name: "Kiran Raj", email: "kiran@gmail.com", domain: "Web", month: "April", correct: 22 }
  ];

  // FILTER DATA
  const filtered = candidates.filter(
    (c) => c.domain === domain && c.month === month
  );

  // EVALUATE
  const evaluated = filtered.map((c) => ({
    ...c,
    percentage: ((c.correct / TOTAL_QUESTIONS) * 100).toFixed(1),
    status: c.correct >= cutoff ? "Passed" : "Rejected"
  }));

  const passed = evaluated.filter((c) => c.status === "Passed");
  const rejected = evaluated.filter((c) => c.status === "Rejected");

  const displayCandidates = evaluated.filter((c) => {
    if (filterStatus === "All") return true;
    return c.status === filterStatus;
  });

  // 📩 MAIL FUNCTIONS
  const sendSelectedMail = () => {
    if (!nextDate || !nextTime) {
      alert("Please select next round date & time");
      return;
    }

    passed.forEach((c) => {
      console.log(`MAIL TO ${c.email}
You passed Technical Round.
Next Round: Coding
Date: ${nextDate}
Time: ${nextTime}`);
    });

    alert("Selected mail sent!");
    setShowModal(false);
  };

  const sendRejectedMail = () => {
    rejected.forEach((c) => {
      console.log(`MAIL TO ${c.email}
Your Score: ${c.correct}/30
Status: Not Selected`);
    });

    alert("Rejection mail sent!");
  };

  return (
    <div className="flex-1 p-6">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-4">💻 Technical Round</h1>

      {/* FILTERS */}
      <div className="flex gap-3 mb-4">
        <select value={domain} onChange={(e) => setDomain(e.target.value)}
          className="bg-[#0f172a] p-2 rounded-lg border border-gray-600">
          <option>ML</option>
          <option>Web</option>
          <option>Data Science</option>
        </select>

        <select value={month} onChange={(e) => setMonth(e.target.value)}
          className="bg-[#0f172a] p-2 rounded-lg border border-gray-600">
          <option>January</option>
          <option>February</option>
          <option>March</option>
          <option>April</option>
          <option>May</option>
        </select>
      </div>

      {/* CRITERIA */}
      <div className="bg-[#111827] p-4 rounded-lg border border-gray-700 mb-6">
        <h3 className="font-semibold mb-2">Technical Test Criteria</h3>

        <p className="text-gray-400 text-sm">
          Total Questions: <span className="text-white font-semibold">30</span>
        </p>

        <label className="text-gray-400 text-sm mt-2 block">
          Minimum Correct Answers Required
        </label>

        <input
          type="number"
          value={cutoff}
          min="0"
          max="30"
          onChange={(e) => setCutoff(Number(e.target.value))}
          className="mt-2 w-full bg-[#0f172a] p-2 rounded-lg border border-gray-600"
        />

        <p className="text-green-400 mt-2">
          Pass Rule: {cutoff} / 30
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div onClick={() => setFilterStatus("All")}
          className="p-4 bg-[#111827] rounded-lg cursor-pointer hover:bg-[#1f2937]">
          <p>Total</p>
          <h2>{evaluated.length}</h2>
        </div>

        <div onClick={() => setFilterStatus("Passed")}
          className="p-4 border border-green-500 rounded-lg cursor-pointer">
          <p className="text-green-400">Passed</p>
          <h2>{passed.length}</h2>
        </div>

        <div onClick={() => setFilterStatus("Rejected")}
          className="p-4 border border-red-500 rounded-lg cursor-pointer">
          <p className="text-red-400">Rejected</p>
          <h2>{rejected.length}</h2>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-[#111827] p-5 rounded-xl border border-gray-700">

        <h3 className="mb-4 font-semibold">Candidate Evaluation</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-[#0f172a] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {displayCandidates.map((c, i) => (
                <tr key={i} className="border-t border-gray-700 hover:bg-[#1f2937]">

                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>

                  <td className="px-4 py-3 text-center font-medium">
                    {c.correct} / 30
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      c.status === "Passed"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}>
                      {c.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 mt-6">

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 px-5 py-2 rounded-lg hover:bg-green-700">
          Send Next Round Mail ({passed.length})
        </button>

        <button
          onClick={sendRejectedMail}
          className="bg-red-600 px-5 py-2 rounded-lg hover:bg-red-700">
          Send Rejection Mail ({rejected.length})
        </button>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">

          <div className="bg-[#111827] p-6 rounded-lg w-96">

            <h2 className="mb-3 font-semibold">Next Round - Coding</h2>

            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="w-full mb-3 p-2 rounded bg-[#0f172a]"
            />

            <input
              type="time"
              value={nextTime}
              onChange={(e) => setNextTime(e.target.value)}
              className="w-full mb-3 p-2 rounded bg-[#0f172a]"
            />

            <div className="flex gap-3">
              <button
                onClick={sendSelectedMail}
                className="bg-green-600 px-4 py-2 rounded w-full">
                Send
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 px-4 py-2 rounded w-full">
                Cancel
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}