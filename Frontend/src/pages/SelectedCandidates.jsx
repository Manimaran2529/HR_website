import { useEffect, useState } from "react";

export default function SelectedCandidates() {

  const [data, setData] = useState([]);

  const fetchData = async () => {
    const res = await fetch("http://127.0.0.1:8000/selected-candidates");
    const d = await res.json();
    setData(d.data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sendAptitude = async () => {
    const sender = prompt("Enter HR Gmail");
    const password = prompt("Enter App Password");

    const formData = new FormData();
    formData.append("sender", sender);
    formData.append("password", password);

    await fetch("http://127.0.0.1:8000/send-aptitude-mails", {
      method: "POST",
      body: formData
    });

    alert("✅ Aptitude mails sent");
    fetchData();
  };

  return (
    <div className="p-6 text-white">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Selected Candidates</h1>

        <button
          onClick={sendAptitude}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Send Aptitude Mail
        </button>
      </div>

      <table className="w-full bg-[#111827] rounded">

        <thead className="bg-[#1f2937]">
          <tr>
            <th className="p-3">Name</th>
            <th>Email</th>
            <th>Domain</th>
            <th>Round</th>
          </tr>
        </thead>

        <tbody>
          {data.map(c => (
            <tr key={c.id} className="border-t border-gray-700">

              <td className="p-3">{c.name}</td>
              <td>{c.email}</td>
              <td>{c.domain}</td>
              <td>{c.round}</td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  );
}