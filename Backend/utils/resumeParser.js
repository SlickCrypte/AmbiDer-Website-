const fs = require("fs");
const pdf = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function parseResume(filePath) {
  try {

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;

    const model = genAI.getGenerativeModel({
     model: "gemini-flash-lite-latest"
    });

    const prompt = `
You are an ATS Resume Parser.

Extract the following information from the resume.

Return ONLY valid JSON.

{
  "name":"",
  "email":"",
  "phone":"",
  "skills":[],
  "experience":"",
  "education":"",
  "projects":[],
  "certifications":[]
}

Resume:

${resumeText}
`;

    let result;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (err) {
        if (err.status === 503 && attempt < 3) {
          console.log(`Gemini busy. Retrying... (${attempt}/3)`);
          await sleep(3000);
        } else {
          throw err;
        }
      }
    }

    const response = await result.response;
    const text = response.text();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);

  } catch (err) {
    console.error("Resume Parser Error:", err);
    throw err;
  }
}

module.exports = parseResume;