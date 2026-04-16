import { useEffect, useState } from "react";

export default function Progress() {

  const [candidates, setCandidates] = useState([]);
  const [date, setDate] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [hrEmail, setHrEmail] = useState("");
  const [hrPassword, setHrPassword] = useState("");

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchData = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/aptitude-candidates");
      const data = await res.json();
      setCandidates(data.data || []);
    } catch {
      alert("❌ Failed to fetch candidates");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===============================
  // UPDATE RESULT
  // ===============================
  const updateResult = async (id, status) => {

    const score = prompt("Enter Score:");

    const formData = new FormData();
    formData.append("score", score);
    formData.append("status", status);

    await fetch(`http://127.0.0.1:8000/update-aptitude/${id}`, {
      method: "PUT",
      body: formData
    });

    fetchData();
  };

  // ===============================
  // SEND MAIL
  // ===============================
  const sendMail = async () => {

    if (!date) {
      alert("Select Date First");
      return;
    }

    const formData = new FormData();
    formData.append("test_date", date);
    formData.append("sender", hrEmail);
    formData.append("password", hrPassword);

    await fetch("http://127.0.0.1:8000/schedule-aptitude", {
      method: "PUT",
      body: formData
    });

    alert("✅ Mail Sent Successfully");

    setShowModal(false);
    setHrEmail("");
    setHrPassword("");
  };

  // ===============================
  // MOVE TO TECHNICAL
  // ===============================
  const moveToTechnical = async () => {

    await fetch("http://127.0.0.1:8000/move-to-technical", {
      method: "PUT"
    });

    alert("🚀 Moved to Technical");
    fetchData();
  };

  // ===============================
  // STATS
  // ===============================
  const total = candidates.length;
  const passed = candidates.filter(c => c.status === "Pass").length;
  const failed = candidates.filter(c => c.status === "Fail").length;

  return (
    <div className="flex-1 bg-[#0b1220] text-white min-h-screen p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">🚀 Aptitude Round Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        <Card title="Total Candidates" value={total} />
        <Card title="Passed" value={passed} green />
        <Card title="Failed" value={failed} red />

      </div>

      {/* ACTION BAR */}
      <div className="bg-[#111827] p-5 rounded-xl mb-6 flex flex-wrap gap-4 items-center">

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[#0f172a] p-3 rounded border border-gray-700"
        />

        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded font-semibold"
        >
          📧 Schedule & Send Mail
        </button>

        <button
          onClick={moveToTechnical}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded font-semibold"
        >
          🚀 Move to Technical
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">

        {candidates.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No candidates available
          </div>
        ) : (

          <table className="w-full text-sm">

            <thead className="bg-[#1f2937] text-gray-400">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th>Domain</th>
                <th>Score</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {candidates.map(c => (
                <tr key={c.id} className="border-t border-gray-700 hover:bg-[#0f172a]">

                  <td className="p-4">{c.name}</td>
                  <td>{c.domain}</td>
                  <td>{c.score}</td>

                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      c.status === "Pass"
                        ? "bg-green-500/20 text-green-400"
                        : c.status === "Fail"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20"
                    }`}>
                      {c.status}
                    </span>
                  </td>

                  <td className="text-center space-x-2">

                    <button
                      onClick={() => updateResult(c.id, "Pass")}
                      className="bg-green-600 px-3 py-1 rounded text-xs"
                    >
                      Pass
                    </button>

                    <button
                      onClick={() => updateResult(c.id, "Fail")}
                      className="bg-red-600 px-3 py-1 rounded text-xs"
                    >
                      Fail
                    </button>

                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

          <div className="bg-[#111827] p-6 rounded-xl w-96">

            <h2 className="text-lg mb-4 text-center">Send Mail</h2>

            <input
              placeholder="Gmail"
              value={hrEmail}
              onChange={(e) => setHrEmail(e.target.value)}
              className="w-full mb-3 p-3 rounded bg-[#0f172a]"
            />

            <input
              type="password"
              placeholder="App Password"
              value={hrPassword}
              onChange={(e) => setHrPassword(e.target.value)}
              className="w-full mb-4 p-3 rounded bg-[#0f172a]"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={sendMail}
                className="bg-blue-600 px-4 py-2 rounded"
              >
                Send
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ===============================
// CARD COMPONENT
// ===============================
function Card({ title, value, green, red }) {
  return (
    <div className={`p-6 rounded-xl border ${
      green ? "border-green-500" :
      red ? "border-red-500" :
      "border-gray-800"
    } bg-[#111827]`}>
      <p className="text-gray-400">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}