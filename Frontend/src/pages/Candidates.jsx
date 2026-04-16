import { useEffect, useState } from "react";

export default function Candidates() {

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);

  const [domainFilter, setDomainFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [hrEmail, setHrEmail] = useState("");
  const [hrPassword, setHrPassword] = useState("");

  // ===============================
  // FETCH
  // ===============================
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/candidates");
      const data = await res.json();
      setCandidates(data.data || []);
    } catch {
      alert("❌ Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // ===============================
  // FILTER
  // ===============================
  const filtered = candidates.filter(c =>
    (domainFilter === "All" || c.domain === domainFilter) &&
    (statusFilter === "All" || c.status === statusFilter)
  );

  const selectedCount = filtered.filter(c => c.status === "Selected").length;
  const rejectedCount = filtered.filter(c => c.status === "Rejected").length;

  // ===============================
  // UPDATE STATUS
  // ===============================
  const updateStatus = async (id, status) => {
    const formData = new FormData();
    formData.append("status", status);

    await fetch(`http://127.0.0.1:8000/candidate/${id}`, {
      method: "PUT",
      body: formData
    });

    fetchCandidates();
  };

  // ===============================
  // AI SELECT
  // ===============================
  const aiSelect = async () => {
    setLoadingAI(true);

    await fetch("http://127.0.0.1:8000/ai-select", {
      method: "POST"
    });

    alert("🤖 AI Completed");
    fetchCandidates();
    setLoadingAI(false);
  };

  // ===============================
  // SEND MAIL (MAIN LOGIC)
  // ===============================
  const sendMail = async () => {
    try {
      const formData = new FormData();
      formData.append("sender", hrEmail);
      formData.append("password", hrPassword);

      const res = await fetch("http://127.0.0.1:8000/send-mails", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      alert(
        `✅ ${data.selected_moved} moved to progress\n❌ ${data.rejected_removed} removed`
      );

      setShowModal(false);
      setHrEmail("");
      setHrPassword("");

      fetchCandidates();

    } catch {
      alert("❌ Mail failed");
    }
  };

  return (
    <div className="flex-1 bg-[#0b1220] text-white min-h-screen">

      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-[#0b1220] p-6 border-b border-gray-800 flex justify-between items-center">

        <h1 className="text-3xl font-bold">📄 Resume Screening</h1>

        <div className="flex gap-3">

          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-xl font-semibold"
          >
            📧 Send Mail ({selectedCount + rejectedCount})
          </button>

          <button
            onClick={aiSelect}
            className="bg-purple-600 px-5 py-2 rounded-xl"
          >
            {loadingAI ? "Processing..." : "🤖 AI Select"}
          </button>

        </div>
      </div>

      <div className="p-6">

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Stat title="Total" value={filtered.length} />
          <Stat title="Selected" value={selectedCount} green />
          <Stat title="Rejected" value={rejectedCount} red />
        </div>

        {/* FILTER */}
        <div className="flex gap-4 mb-6">

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="bg-[#111827] px-4 py-2 rounded border border-gray-700"
          >
            <option>All</option>
            <option>ML</option>
            <option>Web</option>
            <option>Data Science</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111827] px-4 py-2 rounded border border-gray-700"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Selected</option>
            <option>Rejected</option>
          </select>

        </div>

        {/* TABLE */}
        <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-hidden">

          {loading ? (
            <div className="p-6 text-center text-gray-400">
              Loading candidates...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No candidates found
            </div>
          ) : (

            <table className="w-full text-sm">

              <thead className="bg-[#1f2937] text-gray-400">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th>Email</th>
                  <th className="text-center">Phone</th>
                  <th className="text-center">Domain</th>
                  <th className="text-center">Score</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Resume</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-gray-700 hover:bg-[#0f172a]">

                    <td className="p-4">{c.name}</td>
                    <td>{c.email}</td>
                    <td className="text-center">{c.phone}</td>
                    <td className="text-center">{c.domain}</td>
                    <td className="text-center font-semibold">{c.score}%</td>

                    <td className="text-center">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        c.status === "Selected"
                          ? "bg-green-500/20 text-green-400"
                          : c.status === "Rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-500/20"
                      }`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="text-center">
                      <a
                        href={c.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View
                      </a>
                    </td>

                    <td className="text-center space-x-2">

                      <button
                        onClick={() => updateStatus(c.id, "Selected")}
                        className="bg-green-600 px-3 py-1 rounded text-xs"
                      >
                        Select
                      </button>

                      <button
                        onClick={() => updateStatus(c.id, "Rejected")}
                        className="bg-red-600 px-3 py-1 rounded text-xs"
                      >
                        Reject
                      </button>

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

          <div className="bg-[#111827] p-6 rounded-xl w-96">

            <h2 className="text-lg mb-4 text-center">Send Mail</h2>

            <input
              placeholder="HR Gmail"
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
// STAT CARD
// ===============================
function Stat({ title, value, green, red }) {
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