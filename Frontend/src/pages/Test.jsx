import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Test() {

  const { domain } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");

  // ===============================
  // FETCH QUESTIONS
  // ===============================
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/questions?domain=${domain}&type=aptitude`
      );
      const data = await res.json();
      setQuestions(data.data || []);
    } catch {
      alert("❌ Failed to load questions");
    }
  };

  // ===============================
  // SUBMIT TEST
  // ===============================
  const handleSubmit = async () => {

    if (!email) {
      alert("Enter your email");
      return;
    }

    let score = 0;

    questions.forEach(q => {
      if (answers[q.id] === q.answer) {
        score += 10;
      }
    });

    const formData = new FormData();
    formData.append("email", email);
    formData.append("score", score);

    await fetch("http://127.0.0.1:8000/submit-test", {
      method: "POST",
      body: formData
    });

    alert(`✅ Test Submitted! Score: ${score}`);
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white p-6">

      <h1 className="text-2xl font-bold mb-4">
        🧠 {domain} Test
      </h1>

      {/* EMAIL */}
      <input
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
        className="mb-6 p-3 rounded bg-[#111827] w-full border border-gray-700"
      />

      {/* QUESTIONS */}
      {questions.map((q, index) => (
        <div key={q.id} className="mb-6 bg-[#111827] p-4 rounded">

          <p className="mb-3 font-semibold">
            {index + 1}. {q.question}
          </p>

          {q.options.map(opt => (
            <label key={opt} className="block mb-2 cursor-pointer">
              <input
                type="radio"
                name={q.id}
                onChange={() =>
                  setAnswers({ ...answers, [q.id]: opt })
                }
                className="mr-2"
              />
              {opt}
            </label>
          ))}

        </div>
      ))}

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        className="bg-green-600 px-6 py-3 rounded-lg"
      >
        Submit Test
      </button>

    </div>
  );
}