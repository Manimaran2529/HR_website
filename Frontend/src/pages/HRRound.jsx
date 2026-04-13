import { useState, useEffect } from "react";

export default function HRRound() {

  const [schedule, setSchedule] = useState(null);

  // 🔥 Load schedule from Coding Round
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("hrSchedule"));
    setSchedule(data);
  }, []);

  // 🔥 Candidates (Coding Passed)
  const [candidates, setCandidates] = useState([
    { name: "John Doe", email: "john@gmail.com", status: "" },
    { name: "Arun Kumar", email: "arun@gmail.com", status: "" }
  ]);

  // ✅ SELECT / REJECT
  const updateStatus = (index, value) => {
    const updated = [...candidates];
    updated[index].status = value;
    setCandidates(updated);
  };

  // 📩 FINAL MAIL
  const sendFinalResult = () => {
    candidates.forEach((c) => {
      if (c.status === "Selected") {
        console.log(`MAIL TO ${c.email}
🎉 Congratulations!
You are SELECTED for the role.`);
      } else if (c.status === "Rejected") {
        console.log(`MAIL TO ${c.email}
Thank you for attending HR round.
Better luck next time.`);
      }
    });

    alert("Final results sent!");
  };

  return (
    <div className="flex-1 p-6">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        👤 HR Round
      </h1>

      {/* 🔥 SCHEDULE CARD */}
      <div className="bg-gradient-to-r from-[#1f2937] to-[#111827] p-5 rounded-xl border border-gray-700 shadow-lg mb-6">

        <h3 className="text-lg font-semibold mb-3">📅 Interview Schedule</h3>

        {schedule ? (
          <div className="grid grid-cols-3 gap-4 text-sm">

            <div className="bg-[#0f172a] p-3 rounded-lg">
              <p className="text-gray-400">Date</p>
              <p className="font-semibold">{schedule.date}</p>
            </div>

            <div className="bg-[#0f172a] p-3 rounded-lg">
              <p className="text-gray-400">Time</p>
              <p className="font-semibold">{schedule.time}</p>
            </div>

            <div className="bg-[#0f172a] p-3 rounded-lg">
              <p className="text-gray-400">Location</p>
              <p className="font-semibold">{schedule.location}</p>
            </div>

          </div>
        ) : (
          <p className="text-gray-400">No schedule available</p>
        )}

      </div>

      {/* 🔥 TABLE */}
      <div className="bg-[#111827] p-6 rounded-xl border border-gray-700 shadow">

        <h3 className="mb-4 font-semibold text-lg">
          👥 Candidate Interview Panel
        </h3>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-[#0f172a] text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Candidate</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center">Decision</th>
              </tr>
            </thead>

            <tbody>

              {candidates.map((c, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-700 hover:bg-[#1f2937] transition"
                >

                  <td className="px-4 py-3 font-medium">
                    {c.name}
                  </td>

                  <td className="px-4 py-3 text-gray-300">
                    {c.email}
                  </td>

                  <td className="px-4 py-3 text-center">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() => updateStatus(i, "Selected")}
                        className={`px-3 py-1 rounded-lg text-xs transition ${
                          c.status === "Selected"
                            ? "bg-green-600"
                            : "bg-green-900 hover:bg-green-700"
                        }`}
                      >
                        Select
                      </button>

                      <button
                        onClick={() => updateStatus(i, "Rejected")}
                        className={`px-3 py-1 rounded-lg text-xs transition ${
                          c.status === "Rejected"
                            ? "bg-red-600"
                            : "bg-red-900 hover:bg-red-700"
                        }`}
                      >
                        Reject
                      </button>

                    </div>

                    {/* STATUS BADGE */}
                    {c.status && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          c.status === "Selected"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    )}

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* 🔥 ACTION BUTTON */}
      <div className="mt-6 flex justify-end">

        <button
          onClick={sendFinalResult}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg shadow-lg transition"
        >
          🚀 Send Final Results
        </button>

      </div>

    </div>
  );
}