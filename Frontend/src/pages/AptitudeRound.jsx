import { useState } from "react";

export default function AptitudeRound() {

  // 🔥 ONLY HR SCHEDULED DOMAINS
  const scheduledDomains = ["ML", "Data Science", "Web"];

  const [domain, setDomain] = useState("ML");

  // 🔥 DATABASE (SIMULATION)
  const [candidates, setCandidates] = useState([
    { name: "John Doe", email: "john@gmail.com", domain: "ML", marks: 22 },
    { name: "Priya Sharma", email: "priya@gmail.com", domain: "Data Science", marks: 12 },
    { name: "Arun Kumar", email: "arun@gmail.com", domain: "Web", marks: 25 },
    { name: "Kiran Raj", email: "kiran@gmail.com", domain: "ML", marks: 17 }
  ]);

  const cutoff = 18;

  // FILTER DOMAIN
  const filtered = candidates.filter(c => c.domain === domain);

  const evaluated = filtered.map(c => ({
    ...c,
    status: c.marks >= cutoff ? "Passed" : "Rejected"
  }));

  const passed = evaluated.filter(c => c.status === "Passed");
  const rejected = evaluated.filter(c => c.status === "Rejected");

  // 🔥 SEND MAIL FUNCTIONS
  const sendSelectedMail = () => {
    passed.forEach(c => {
      console.log(`MAIL TO ${c.email}
You passed Aptitude 🎉`);
    });

    alert("Selected mail sent!");
  };

  const sendRejectedMail = () => {
    rejected.forEach(c => {
      console.log(`MAIL TO ${c.email}
Better luck next time`);
    });

    // ❌ REMOVE REJECTED FROM DATABASE
    setCandidates(prev =>
      prev.filter(c => !(c.domain === domain && c.marks < cutoff))
    );

    alert("Rejected candidates removed!");
  };

  return (
    <div className="flex-1 p-6">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-6">🧠 Aptitude Round</h1>

      {/* DOMAIN SELECT */}
      <select
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        className="mb-6 bg-[#0f172a] p-2 rounded-lg border border-gray-600"
      >
        {scheduledDomains.map((d, i) => (
          <option key={i}>{d}</option>
        ))}
      </select>

      {/* CRITERIA */}
      <div className="bg-[#111827] p-4 rounded-lg border border-gray-700 mb-6">

        <h3 className="font-semibold mb-2">Aptitude Test Criteria</h3>

        <p className="text-gray-400 text-sm">
          Total Questions: <span className="text-white">30</span>
        </p>

        <p className="text-gray-400 text-sm mt-2">
          Minimum Correct Answers Required
        </p>

        <input
          value={cutoff}
          disabled
          className="mt-2 w-full bg-[#0f172a] p-2 rounded-lg border border-gray-600"
        />

        <p className="text-green-400 mt-2">
          Pass Rule: {cutoff} / 30
        </p>

      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <Box title="Total" value={evaluated.length} />
        <Box title="Passed" value={passed.length} green />
        <Box title="Rejected" value={rejected.length} red />

      </div>

      {/* TABLE */}
      <div className="bg-[#111827] p-4 rounded-lg border border-gray-700">

        <h3 className="mb-4 font-semibold">Candidate Results</h3>

        <table className="w-full text-sm">

          <thead className="text-gray-400">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Domain</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {evaluated.map((c, i) => (
              <tr key={i} className="border-t border-gray-700">

                <td className="py-2">{c.name}</td>
                <td>{c.email}</td>
                <td>{c.domain}</td>
                <td>{c.marks}/30</td>

                <td>
                  <span className={`px-2 py-1 rounded text-xs ${
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

      {/* BUTTONS */}
      <div className="flex gap-4 mt-6">

        <button
          onClick={sendSelectedMail}
          className="bg-green-600 px-5 py-2 rounded-lg">
          Send Selected Mail ({passed.length})
        </button>

        <button
          onClick={sendRejectedMail}
          className="bg-red-600 px-5 py-2 rounded-lg">
          Send Rejection Mail ({rejected.length})
        </button>

      </div>

    </div>
  );
}

/* CARD */
function Box({ title, value, green, red }) {
  return (
    <div className={`p-4 rounded-lg ${
      green ? "border border-green-500" :
      red ? "border border-red-500" :
      "border border-gray-700"
    }`}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}