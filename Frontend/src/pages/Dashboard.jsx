import { useMemo } from "react";

export default function Dashboard() {

  /* 🔥 TODAY DATE */
  const today = new Date().toISOString().split("T")[0];

  /* 🔥 SAMPLE CANDIDATE DATA */
  const candidates = [
    { name: "John Doe", appliedDate: today },
    { name: "Arun Kumar", appliedDate: today },
    { name: "Priya Sharma", appliedDate: "2026-04-01" },
    { name: "Kiran Raj", appliedDate: today },
    { name: "Sneha", appliedDate: "2026-04-02" }
  ];

  /* 🔥 TODAY APPLICATION COUNT */
  const todayApplications = useMemo(
    () => candidates.filter(c => c.appliedDate === today).length,
    [candidates, today]
  );

  /* 🔥 INTERVIEW DATA */
  const interviews = [
    { name: "John Doe", domain: "ML", date: today, time: "10:00 AM" },
    { name: "Arun Kumar", domain: "Web", date: today, time: "02:00 PM" },
    { name: "Sneha", domain: "Data Science", date: "2026-04-06", time: "11:00 AM" }
  ];

  const todayInterviews = interviews.filter(i => i.date === today);
  const upcomingInterviews = interviews.filter(i => i.date !== today);

  return (
    <div className="flex-1 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">📊 Dashboard</h1>
        <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm">
          + New Hiring
        </button>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-5 gap-4 mb-6">

        <StatCard title="Total Applications" value="248" sub="+34 this week" />

        {/* 🔥 NEW */}
        <StatCard 
          title="Today Applications" 
          value={todayApplications} 
          sub="Live count" 
          blue 
        />

        <StatCard title="Selected" value="86" sub="+12 selected" green />
        <StatCard title="Rejected" value="120" sub="+20 rejected" red />
        <StatCard title="Open Vacancies" value="9" sub="Active roles" />

      </div>

      {/* 🔥 MAIN GRID */}
      <div className="grid grid-cols-3 gap-4">

        {/* DOMAIN VACANCIES */}
        <div className="card">
          <h3 className="title mb-3">📌 Domain Vacancies</h3>

          <Vacancy title="ML Engineer" tech="Python, ML" status="Open" />
          <Vacancy title="Web Developer" tech="React, Node" status="Open" />
          <Vacancy title="Data Analyst" tech="SQL, Python" status="Closed" />
          <Vacancy title="UI/UX Designer" tech="Figma" status="Open" />
        </div>

        {/* FUNNEL */}
        <div className="card">
          <h3 className="title mb-3">📊 Recruitment Funnel</h3>

          <Progress label="Applications" value="248" width="100%" />
          <Progress label="Aptitude" value="120" width="50%" />
          <Progress label="Technical" value="70" width="30%" />
          <Progress label="Coding" value="44" width="20%" />
          <Progress label="HR" value="26" width="15%" />
          <Progress label="Offers" value="14" width="10%" />
        </div>

        {/* INTERVIEW PANEL */}
        <div className="space-y-4">

          {/* TODAY */}
          <div className="card">
            <h3 className="title mb-2">📅 Today Interviews</h3>

            {todayInterviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No interviews today</p>
            ) : (
              todayInterviews.map((i, idx) => (
                <div key={idx} className="p-2 bg-[#0f172a] rounded mb-2">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-gray-400">
                    {i.domain} • {i.time}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* UPCOMING */}
          <div className="card">
            <h3 className="title mb-2">⏳ Upcoming Interviews</h3>

            {upcomingInterviews.map((i, idx) => (
              <div key={idx} className="p-2 bg-[#0f172a] rounded mb-2">
                <p className="font-medium">{i.name}</p>
                <p className="text-xs text-gray-400">
                  {i.domain} • {i.date} • {i.time}
                </p>
              </div>
            ))}
          </div>

          {/* MAIL */}
          <div className="card">
            <h3 className="title mb-2">📬 Mail Activity</h3>
            <p className="text-green-400 text-sm">● Selected mails sent</p>
            <p className="text-red-400 text-sm">● Rejection mails sent</p>
            <p className="text-blue-400 text-sm">● Test links sent</p>
          </div>

        </div>

      </div>

      {/* 🔥 DOMAIN PROGRESS */}
      <div className="mt-6 card">
        <h3 className="title mb-4">📊 Domain-wise Progress</h3>

        <table className="w-full text-left text-sm">

          <thead className="text-gray-400">
            <tr>
              <th>Domain</th>
              <th>Aptitude</th>
              <th>Technical</th>
              <th>Coding</th>
              <th>HR</th>
            </tr>
          </thead>

          <tbody>
            <Row domain="ML" apt="Done" tech="In Progress" code="Pending" hr="Pending" />
            <Row domain="Web" apt="Done" tech="Done" code="In Progress" hr="Pending" />
            <Row domain="Data Science" apt="Done" tech="Pending" code="Pending" hr="Pending" />
          </tbody>

        </table>
      </div>

    </div>
  );
}

/* 🔹 COMPONENTS */

function StatCard({ title, value, sub, green, red, blue }) {
  let color = "";

  if (green) color = "text-green-400";
  else if (red) color = "text-red-400";
  else if (blue) color = "text-blue-400";

  return (
    <div className="bg-[#111827] p-4 rounded-xl border border-gray-700">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className={`text-sm ${color}`}>{sub}</p>
    </div>
  );
}

function Vacancy({ title, tech, status }) {
  return (
    <div className="flex justify-between items-center mb-3 p-3 bg-[#0f172a] rounded-lg">
      <div>
        <p>{title}</p>
        <p className="text-gray-400 text-sm">{tech}</p>
      </div>
      <span className={`px-2 py-1 text-xs rounded ${
        status === "Open" ? "bg-green-600" : "bg-red-600"
      }`}>
        {status}
      </span>
    </div>
  );
}

function Progress({ label, value, width }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-gray-700 h-2 rounded-full">
        <div className="bg-blue-500 h-2 rounded-full" style={{ width }}></div>
      </div>
    </div>
  );
}

function Row({ domain, apt, tech, code, hr }) {
  return (
    <tr className="border-t border-gray-700">
      <td className="py-2">{domain}</td>
      <td><Status s={apt} /></td>
      <td><Status s={tech} /></td>
      <td><Status s={code} /></td>
      <td><Status s={hr} /></td>
    </tr>
  );
}

function Status({ s }) {
  let color = "bg-gray-600";
  if (s === "Done") color = "bg-green-600";
  if (s === "In Progress") color = "bg-yellow-500";

  return (
    <span className={`px-2 py-1 text-xs rounded ${color}`}>
      {s}
    </span>
  );
}