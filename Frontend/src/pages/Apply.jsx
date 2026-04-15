import { useState, useRef } from "react";

export default function Apply() {

  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    domain: "ML",
    file: null
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async () => {

    if (!form.name || !form.email || !form.phone || !form.file) {
      alert("⚠️ Please fill all fields");
      return;
    }

    if (!form.file.name.toLowerCase().endsWith(".pdf")) {
      alert("⚠️ Only PDF allowed");
      return;
    }

    const data = new FormData();
    data.append("name", form.name);
    data.append("email", form.email);
    data.append("phone", form.phone);
    data.append("domain", form.domain);
    data.append("resume", form.file);

    try {
      setLoading(true);
      setSuccess(false);

      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: data
      });

      const result = await res.json();

      // ✅ HANDLE BACKEND ERROR MESSAGE
      if (!res.ok) {
        alert(result.detail || "❌ Upload failed");
        return;
      }

      // ✅ SUCCESS
      setSuccess(true);

      setForm({
        name: "",
        email: "",
        phone: "",
        domain: "ML",
        file: null
      });

      // 🔥 RESET FILE INPUT
      if (fileRef.current) {
        fileRef.current.value = "";
      }

    } catch (err) {
      alert("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] text-white px-4">

      <div className="w-full max-w-md bg-[#111827] p-6 rounded-xl border border-gray-700 shadow-lg">

        {/* HEADER */}
        <h2 className="text-2xl font-semibold text-center mb-2">
          🚀 Apply for Job
        </h2>

        <p className="text-gray-400 text-sm text-center mb-6">
          Upload your resume and start your journey
        </p>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="bg-green-600 text-white p-3 rounded mb-4 text-center text-sm">
            ✅ Application submitted successfully! <br />
            <span className="text-xs">
              We will contact you soon 🙌
            </span>
          </div>
        )}

        {/* NAME */}
        <div className="mb-4">
          <label className="text-sm text-gray-400">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter your name"
            className="w-full mt-1 p-2 bg-[#0f172a] rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
          />
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="text-sm text-gray-400">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Enter your email"
            className="w-full mt-1 p-2 bg-[#0f172a] rounded-lg border border-gray-600 outline-none"
          />
        </div>

        {/* PHONE */}
        <div className="mb-4">
          <label className="text-sm text-gray-400">Phone Number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Enter phone number"
            className="w-full mt-1 p-2 bg-[#0f172a] rounded-lg border border-gray-600 outline-none"
          />
        </div>

        {/* DOMAIN */}
        <div className="mb-4">
          <label className="text-sm text-gray-400">Select Role</label>
          <select
            value={form.domain}
            onChange={(e) => setForm({ ...form, domain: e.target.value })}
            className="w-full mt-1 p-2 bg-[#0f172a] rounded-lg border border-gray-600 outline-none"
          >
            <option value="ML">ML</option>
            <option value="Web">Web</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>

        {/* FILE */}
        <div className="mb-4">
          <label className="text-sm text-gray-400">
            Upload Resume (PDF)
          </label>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={(e) =>
              setForm({ ...form, file: e.target.files[0] })
            }
            className="mt-2 w-full text-sm"
          />

          {form.file && (
            <p className="text-xs text-gray-400 mt-1">
              📄 {form.file.name}
            </p>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-medium transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Submit Application"}
        </button>

      </div>
    </div>
  );
}