export default function DomainProgress() {

  const data = [
    {
      domain: "ML",
      aptitude: "Done",
      technical: "In Progress",
      coding: "Pending",
      hr: "Pending",
    },
    {
      domain: "Web",
      aptitude: "Done",
      technical: "Done",
      coding: "In Progress",
      hr: "Pending",
    },
    {
      domain: "Data Science",
      aptitude: "Done",
      technical: "Pending",
      coding: "Pending",
      hr: "Pending",
    },
  ];

  const getColor = (status) => {
    if (status === "Done") return "bg-green-600";
    if (status === "In Progress") return "bg-yellow-500";
    return "bg-gray-600";
  };

  return (
    <div className="bg-[#111827] p-5 rounded-xl border border-gray-700">

      <h2 className="text-lg font-semibold mb-4">Domain Progress</h2>

      <table className="w-full text-left">

        <thead className="text-gray-400 text-sm">
          <tr>
            <th>Domain</th>
            <th>Aptitude</th>
            <th>Technical</th>
            <th>Coding</th>
            <th>HR</th>
          </tr>
        </thead>

        <tbody>
          {data.map((d, i) => (
            <tr key={i} className="border-t border-gray-700">

              <td className="py-2">{d.domain}</td>

              <td><Status status={d.aptitude} color={getColor(d.aptitude)} /></td>
              <td><Status status={d.technical} color={getColor(d.technical)} /></td>
              <td><Status status={d.coding} color={getColor(d.coding)} /></td>
              <td><Status status={d.hr} color={getColor(d.hr)} /></td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

function Status({ status, color }) {
  return (
    <span className={`px-2 py-1 text-xs rounded ${color}`}>
      {status}
    </span>
  );
}