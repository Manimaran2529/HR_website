import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function Analytics() {

  // 🔥 FAKE DATA (MONTH + DOMAIN WISE SELECTED)
  const data = [
    { month: "Jan", ML: 12, Web: 8, "Data Science": 5 },
    { month: "Feb", ML: 18, Web: 10, "Data Science": 9 },
    { month: "Mar", ML: 22, Web: 14, "Data Science": 12 },
    { month: "Apr", ML: 26, Web: 18, "Data Science": 15 },
    { month: "May", ML: 30, Web: 20, "Data Science": 18 }
  ];

  return (
    <div className="flex-1 p-6">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mb-6">
        📊 Hiring Analytics
      </h1>

      {/* 🔥 SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <Card title="Total Selected (May)" value="68" color="green" />
        <Card title="Top Domain" value="ML" color="blue" />
        <Card title="Growth" value="+12%" color="yellow" />

      </div>

      {/* 🔥 BAR CHART */}
      <div className="bg-[#111827] p-6 rounded-xl border border-gray-700">

        <h3 className="mb-4 font-semibold">
          📈 Monthly Selection by Domain
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>

            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Bar dataKey="ML" />
            <Bar dataKey="Web" />
            <Bar dataKey="Data Science" />

          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* 🔥 TABLE VIEW */}
      <div className="bg-[#111827] p-6 rounded-xl border border-gray-700 mt-6">

        <h3 className="mb-4 font-semibold">
          📋 Detailed Report
        </h3>

        <table className="w-full text-sm">

          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="text-left py-2">Month</th>
              <th className="text-center">ML</th>
              <th className="text-center">Web</th>
              <th className="text-center">Data Science</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-gray-800">

                <td className="py-2">{row.month}</td>
                <td className="text-center">{row.ML}</td>
                <td className="text-center">{row.Web}</td>
                <td className="text-center">{row["Data Science"]}</td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}

/* 🔥 CARD COMPONENT */
function Card({ title, value, color }) {

  let textColor = "text-white";

  if (color === "green") textColor = "text-green-400";
  if (color === "blue") textColor = "text-blue-400";
  if (color === "yellow") textColor = "text-yellow-400";

  return (
    <div className="bg-[#111827] p-4 rounded-xl border border-gray-700">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className={`text-2xl font-bold ${textColor}`}>
        {value}
      </h2>
    </div>
  );
}