import { useEffect, useState } from "react";

export default function Progress() {

  const [candidates, setCandidates] = useState([]);
  const [testDate, setTestDate] = useState("");

  const fetchCandidates = async () => {
    const res = await fetch("http://127.0.0.1:8000/aptitude-candidates");
    const data = await res.json();
    setCandidates(data.data || []);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // ===============================
  // UPDATE RESULT
  // ===============================
  const updateResult = async (id, score, status) => {

    const formData = new FormData();
    formData.append("score", score);
    formData.append("status", status);

    await fetch(`http://127.0.0.1:8000/update-aptitude/${id}`, {
      method: "PUT",
      body: formData
    });

    fetchCandidates();
  };

  // ===============================
  // MOVE TO TECHNICAL
  // ===============================
  const moveNext = async () => {

    await fetch("http://127.0.0.1:8000/move-to-technical", {
      method: "PUT"
    });

    alert("Moved to Technical");
    fetchCandidates();
  };

  return (
    <div className="flex-1 bg-[#0b1220] text-white min-h-screen p-6">

      <h1 className="text-3xl font-bold mb-6">🧠 Aptitude Round</h1>

      {/* 🔥 TOP CONTROL PANEL */}
      <div className="bg-[#111827] p-4 rounded-xl mb-6 flex gap-4 items-center">

        <input
          type="datetime-local"
          value={testDate}
          onChange={(e) => setTestDate(e.target.value)}
          className="bg-[#0f172a] px-4 py-2 rounded border border-gray-700"
        />

        <button className="bg-yellow-600 px-5 py-2 rounded">
          Send Mail
        </button>

        <button
          onClick={moveNext}
          className="bg-blue-600 px-5 py-2 rounded"
        >
          Move to Technical →
        </button>

      </div>

      {/* 🔥 TABLE */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-[#1f2937] text-gray-400">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th>Domain</th>
              <th className="text-center">Score</th>
              <th className="text-center">Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {candidates.map(c => (

              <tr key={c.id} className="border-t border-gray-700">

                <td className="p-4">{c.name}</td>
                <td>{c.domain}</td>

                <td className="text-center">
                  <input
                    type="number"
                    defaultValue={c.score}
                    onChange={(e) => c.tempScore = e.target.value}
                    className="w-16 bg-[#0f172a] p-1 rounded"
                  />
                </td>

                <td className="text-center">
                  <span className={
                    c.status === "Pass"
                      ? "text-green-400"
                      : c.status === "Fail"
                      ? "text-red-400"
                      : "text-gray-400"
                  }>
                    {c.status}
                  </span>
                </td>

                <td className="text-center space-x-2">

                  <button
                    onClick={() => updateResult(c.id, c.tempScore || 0, "Pass")}
                    className="bg-green-600 px-3 py-1 rounded text-xs"
                  >
                    Pass
                  </button>

                  <button
                    onClick={() => updateResult(c.id, c.tempScore || 0, "Fail")}
                    className="bg-red-600 px-3 py-1 rounded text-xs"
                  >
                    Fail
                  </button>

                </td>

              </tr>

            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}