import { useState } from "react";

export default function CodingRound() {

  const TOTAL_PROBLEMS = 5;

  const [domain, setDomain] = useState("ML");
  const [month, setMonth] = useState("April");
  const [cutoff, setCutoff] = useState(3);
  const [filterStatus, setFilterStatus] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("");
  const [location, setLocation] = useState("Office");

  // 🔥 TECHNICAL PASSED STUDENTS (Dummy)
  const candidates = [
    { name: "John Doe", email: "john@gmail.com", domain: "ML", month: "April", solved: 4 },
    { name: "Arun Kumar", email: "arun@gmail.com", domain: "ML", month: "April", solved: 2 },
    { name: "Kiran Raj", email: "kiran@gmail.com", domain: "Web", month: "April", solved: 5 },
    { name: "Sneha Patel", email: "sneha@gmail.com", domain: "Data Science", month: "April", solved: 3 }
  ];

  // FILTER
  const filtered = candidates.filter(
    (c) => c.domain === domain && c.month === month
  );

  // EVALUATE
  const evaluated = filtered.map((c) => ({
    ...c,
    percentage: ((c.solved / TOTAL_PROBLEMS) * 100).toFixed(1),
    status: c.solved >= cutoff ? "Passed" : "Rejected"
  }));

  const passed = evaluated.filter((c) => c.status === "Passed");
  const rejected = evaluated.filter((c) => c.status === "Rejected");

  const display = evaluated.filter((c) => {
    if (filterStatus === "All") return true;
    return c.status === filterStatus;
  });

  // ✅ SAVE HR SCHEDULE + SEND MAIL
  const sendSelectedMail = () => {
    if (!nextDate || !nextTime) {
      alert("Please select HR round date & time");
      return;
    }

    // 🔥 SAVE FOR HR ROUND PAGE
    localStorage.setItem("hrSchedule", JSON.stringify({
      date: nextDate,
      time: nextTime,
      location: location,
      domain: domain,
      month: month
    }));

    passed.forEach((c) => {
      console.log(`MAIL TO ${c.email}
You passed Coding Round 🎉
Next Round: HR Interview
Date: ${nextDate}
Time: ${nextTime}
Location: ${location}`);
    });

    alert("HR Round scheduled & mails sent!");
    setShowModal(false);
  };

  const sendRejectedMail = () => {
    rejected.forEach((c) => {
      console.log(`MAIL TO ${c.email}
Coding Score: ${c.solved}/${TOTAL_PROBLEMS}
Better luck next time`);
    });

    alert("Rejection mail sent!");
  };

  return (
    <div className="flex-1 p-6">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-4">💻 Coding Round</h1>

      {/* FILTER */}
      <div className="flex gap-3 mb-4">
        <select value={domain} onChange={(e) => setDomain(e.target.value)}
          className="bg-[#0f172a] p-2 rounded-lg border border-gray-600">
          <option>ML</option>
          <option>Web</option>
          <option>Data Science</option>
        </select>

        <select value={month} onChange={(e) => setMonth(e.target.value)}
          className="bg-[#0f172a] p-2 rounded-lg border border-gray-600">
          <option>March</option>
          <option>April</option>
          <option>May</option>
        </select>
      </div>

      {/* CRITERIA */}
      <div className="bg-[#111827] p-4 rounded-lg border border-gray-700 mb-6">
        <h3 className="font-semibold mb-2">Coding Test Criteria</h3>

        <p className="text-gray-400 text-sm">
          Total Problems: <span className="text-white font-semibold">5</span>
        </p>

        <label className="text-gray-400 text-sm mt-2 block">
          Minimum Problems to Pass
        </label>

        <input
          type="number"
          value={cutoff}
          min="0"
          max="5"
          onChange={(e) => setCutoff(Number(e.target.value))}
          className="mt-2 w-full bg-[#0f172a] p-2 rounded-lg border border-gray-600"
        />

        <p className="text-green-400 mt-2">
          Pass Rule: {cutoff} / 5 solved
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
                <th className="px-4 py-3 text-center">Solved</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {display.map((c, i) => (
                <tr key={i} className="border-t border-gray-700 hover:bg-[#1f2937]">

                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>

                  <td className="px-4 py-3 text-center">
                    {c.solved} / 5
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
          className="bg-green-600 px-5 py-2 rounded-lg">
          Schedule HR Round ({passed.length})
        </button>

        <button
          onClick={sendRejectedMail}
          className="bg-red-600 px-5 py-2 rounded-lg">
          Send Rejection Mail ({rejected.length})
        </button>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">

          <div className="bg-[#111827] p-6 rounded-lg w-96">

            <h2 className="mb-3 font-semibold">HR Round Schedule</h2>

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

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full mb-3 p-2 rounded bg-[#0f172a]"
            />

            <div className="flex gap-3">
              <button
                onClick={sendSelectedMail}
                className="bg-green-600 px-4 py-2 rounded w-full">
                Confirm & Send
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