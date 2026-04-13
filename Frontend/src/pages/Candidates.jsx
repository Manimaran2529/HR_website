import { useEffect, useState } from "react";

export default function Candidates() {

  const [candidates, setCandidates] = useState([]);
  const [domainFilter, setDomainFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loadingAI, setLoadingAI] = useState(false);

  // ✅ FETCH FROM BACKEND
  const fetchCandidates = () => {
    fetch("http://127.0.0.1:8000/candidates")
      .then(res => res.json())
      .then(data => setCandidates(data.data))
      .catch(() => alert("Failed to fetch candidates"));
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // ✅ FILTER
  const filtered = candidates.filter(c =>
    (domainFilter === "All" || c.domain === domainFilter) &&
    (statusFilter === "All" || c.status === statusFilter)
  );

  // ✅ COUNTS
  const total = filtered.length;
  const selectedCount = filtered.filter(c => c.status === "Selected").length;
  const rejectedCount = filtered.filter(c => c.status === "Rejected").length;

  // ✅ UPDATE STATUS
  const updateStatus = async (id, status) => {
    const formData = new FormData();
    formData.append("status", status);

    await fetch(`http://127.0.0.1:8000/candidate/${id}`, {
      method: "PUT",
      body: formData
    });

    fetchCandidates();
  };

  // 🤖 AI SELECT
  const aiSelect = async () => {

    if (domainFilter === "All") {
      alert("⚠️ Please select a domain first");
      return;
    }

    setLoadingAI(true);

    const formData = new FormData();
    formData.append("domain", domainFilter);

    await fetch("http://127.0.0.1:8000/ai-select", {
      method: "POST",
      body: formData
    });

    alert("🤖 AI Selection Completed!");
    setLoadingAI(false);
    fetchCandidates();
  };

  return (
    <div className="flex-1 p-6">

      {/* TITLE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Candidates</h1>

        <button
          onClick={aiSelect}
          className="bg-purple-600 px-5 py-2 rounded-lg"
        >
          {loadingAI ? "Processing..." : "🤖 AI Smart Selection"}
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400">Total</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </div>

        <div className="bg-green-900/20 border border-green-500 p-4 rounded-xl">
          <p className="text-green-400">Selected</p>
          <h2 className="text-2xl font-bold">{selectedCount}</h2>
        </div>

        <div className="bg-red-900/20 border border-red-500 p-4 rounded-xl">
          <p className="text-red-400">Rejected</p>
          <h2 className="text-2xl font-bold">{rejectedCount}</h2>
        </div>

      </div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-6">

        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="bg-[#111827] px-3 py-2 rounded-lg border border-gray-700"
        >
          <option>All</option>
          <option>ML</option>
          <option>Web</option>
          <option>Data Science</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111827] px-3 py-2 rounded-lg border border-gray-700"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Selected</option>
          <option>Rejected</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-[#1f2937] text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Domain</th>
              <th className="px-4 py-3 text-center">Score</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Resume</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-gray-700 hover:bg-[#0f172a]">

                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3">{c.domain}</td>

                {/* SCORE */}
                <td className="px-4 py-3 text-center">
                  {c.score ? `${c.score}%` : "-"}
                </td>

                {/* STATUS */}
                <td className="px-4 py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    c.status === "Selected"
                      ? "bg-green-600"
                      : c.status === "Rejected"
                      ? "bg-red-600"
                      : "bg-gray-600"
                  }`}>
                    {c.status}
                  </span>
                </td>

                {/* RESUME */}
                <td className="px-4 py-3 text-center">
                  <a
                    href={c.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View PDF
                  </a>
                </td>

                {/* ACTION */}
                <td className="px-4 py-3 text-center space-x-2">

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

      </div>

      {/* MAIL BUTTONS */}
      <div className="flex gap-4 mt-6">

        <button className="bg-green-600 px-5 py-2 rounded-lg">
          Send Selected Mail ({selectedCount})
        </button>

        <button className="bg-red-600 px-5 py-2 rounded-lg">
          Send Rejection Mail ({rejectedCount})
        </button>

      </div>

    </div>
  );
}