const Student = require("../models/Student");
const Staff = require("../models/Staff");
const Transaction = require("../models/Transaction");
const Attendance = require("../models/Attendance");

const callOpenRouterAPI = async (messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is missing in backend/.env file");
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "CampusHub ERP",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: messages,
        temperature: 0.6,
        max_tokens: 1200,
      }),
    },
  );

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "OpenRouter API Error");
  }

  return data.choices?.[0]?.message?.content || "";
};

const copilotChat = async (req, res) => {
  try {
    const { message, context, chatHistory } = req.body;
    if (!message) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required." });
    }

    const [totalStudents, totalFaculty, transactions, todayAttendance] =
      await Promise.all([
        Student.countDocuments({ status: "Enrolled" }).catch(() => 0),
        Staff.countDocuments({ status: "Active" }).catch(() => 0),
        Transaction.find().catch(() => []),
        Attendance.find({
          date: { $gte: new Date().setHours(0, 0, 0, 0) },
        }).catch(() => []),
      ]);

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach((t) => {
      if (t.type === "Income") totalIncome += Number(t.amount) || 0;
      if (t.type === "Expense") totalExpense += Number(t.amount) || 0;
    });
    const netBalance = totalIncome - totalExpense;

    const totalMarkedToday = todayAttendance.length;
    const presentToday = todayAttendance.filter(
      (a) => a.status === "Present",
    ).length;
    const attendancePct =
      totalMarkedToday > 0
        ? ((presentToday / totalMarkedToday) * 100).toFixed(1)
        : "N/A";

    const systemPrompt = `You are CampusHub AI Copilot, an academic and administrative AI assistant for a University ERP.
Live Campus Context:
- Enrolled Students: ${totalStudents}
- Faculty/Staff: ${totalFaculty}
- Today's Attendance: ${attendancePct}% (${presentToday} present / ${totalMarkedToday} marked)
- Finance Balance: PKR ${netBalance}
- Active Context: ${context || "General Campus"}

Provide accurate, intelligent, and concise responses.`;

    const messages = [{ role: "system", content: systemPrompt }];
    if (Array.isArray(chatHistory)) {
      chatHistory.forEach((msg) => {
        if (msg.sender && msg.text) {
          messages.push({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          });
        }
      });
    }
    messages.push({ role: "user", content: message });

    const reply = await callOpenRouterAPI(messages);
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Copilot Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const generateQuizQuestions = async (req, res) => {
  try {
    const { topic, subject, difficulty = "Medium", count = 5 } = req.body;
    if (!topic || !subject) {
      return res
        .status(400)
        .json({ success: false, message: "Topic and subject are required." });
    }

    const prompt = `Generate ${count} ${difficulty} level multiple-choice questions on "${topic}" in "${subject}".
Format strictly as a JSON array:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact matching option",
    "explanation": "Brief explanation"
  }
]
Return valid raw JSON only without markdown formatting.`;

    const raw = await callOpenRouterAPI([{ role: "user", content: prompt }]);
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return res.status(200).json({ success: true, data: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Quiz Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const generateStudyPack = async (req, res) => {
  try {
    const { content, courseCode } = req.body;
    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required." });
    }

    const prompt = `Analyze this course content for "${courseCode || "General Studies"}":
"${content}"

Output strictly valid JSON matching this schema:
{
  "summary": "Core summary",
  "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
  "vivaQuestions": [
    { "question": "Question?", "answer": "Answer" }
  ]
}
Return raw JSON only without markdown formatting.`;

    const raw = await callOpenRouterAPI([{ role: "user", content: prompt }]);
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return res.status(200).json({ success: true, data: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Study Pack Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  copilotChat,
  generateQuizQuestions,
  generateStudyPack,
};
