const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ خطأ: GEMINI_API_KEY غير موجود في البيئة");
  process.exit(1);
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("خطأ Gemini:", error.response?.data || error.message);
    return null;
  }
}

async function searchPexels(query) {
  if (!PEXELS_API_KEY) return [];
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=3`;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: PEXELS_API_KEY }
    });
    return response.data.videos.map(v => v.video_files[0]?.link).filter(Boolean);
  } catch (error) {
    console.error("خطأ Pexels:", error.message);
    return [];
  }
}

const userCommand = process.argv.slice(2).join(' ');
if (!userCommand) {
  console.log("📝 الاستخدام: node assistant.js \"أمرك هنا\"");
  process.exit(0);
}

(async () => {
  console.log(`🚀 تنفيذ: "${userCommand}"\n`);
  
  const plan = await callGemini(`حول الأمر التالي إلى خطة عمل مفصلة: ${userCommand}`);
  console.log("📋 الخطة:\n", plan || "تعذر إنشاء خطة");
  
  if (userCommand.match(/فيديو|pexels/i) && PEXELS_API_KEY) {
    const keywords = userCommand.split(' ').slice(-3).join(' ');
    const videos = await searchPexels(keywords);
    if (videos.length) {
      console.log("\n🎬 روابط فيديوهات من Pexels:");
      videos.forEach((v, i) => console.log(`${i+1}. ${v}`));
    }
  }
  
  console.log("\n✅ تم.");
})();
