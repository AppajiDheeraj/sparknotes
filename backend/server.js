import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// API Route
app.post("/summarize", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    // Run yt-dlp script
    const scriptPath = path.join(__dirname, "summarizer.py");
    const ytDlpPath = path.join(__dirname, "yt-dlp.exe");
    const pythonProcess = execFile("python", [scriptPath, url], { timeout: 60000 });

    let transcript = "";
    pythonProcess.stdout.on("data", (data) => {
      transcript += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error("yt-dlp Error:", data.toString());
    });

    pythonProcess.on("close", async (code) => {
      if (code !== 0 || !transcript) {
        return res.status(500).json({ error: "Transcript extraction failed" });
      }

      // Summarize via Gemini
const prompt = `
You are an AI expert summarizer. Summarize the following YouTube transcript STRICTLY in this format:

## Title:
<Short, catchy video title(if not present generate one)>

## Context:
<Brief context of what this video is about, in 1-2 sentences>

## Description:
<Concise summary of the key points discussed in the video, It must be 1-2 paragraphs long and should not include any technical logs, download processes, or subtitles. Focus on the main topics, insights, and conclusions drawn in the video. >

## Tools/Technologies Mentioned:
<List of tools, software, or technologies mentioned in the video, generate a list of tools based on the transcript content if any; otherwise write "None">

## Actionable Tips:
<Provide practical tips or advice derived from the video content that viewers can apply in their own lives or work environment if applicable; otherwise generate it based on the transcript>

**(Optional Advanced Sections — only include if applicable in the transcript):**

## Quotes/Notable Insights:
<Include any impactful quotes or thought-provoking ideas from the video. If none, generate a relevant quote based on the transcript content>

## Further Resources or References:
<List any books, articles, websites, or other resources mentioned. If none, generate relevant resources based on the transcript content>

ONLY use this structure. Do not add anything else.

### Transcript:
${transcript}
`;
      const result = await model.generateContent(prompt);
      const summary = result.response.text();
      res.json({ summary });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(5000, () => {
  console.log("Backend API running on http://localhost:5000");
});

async function runTranscriptExtraction(url) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "summarizer.py");
    const pythonProcess = execFile("python", [scriptPath, url], { timeout: 60000 });

    let transcript = "";
    pythonProcess.stdout.on("data", (data) => transcript += data.toString());
    pythonProcess.stderr.on("data", (data) => console.error("yt-dlp Error:", data.toString()));

    pythonProcess.on("close", (code) => {
      if (code !== 0 || !transcript) {
        reject("Transcript extraction failed");
      } else {
        resolve(transcript);
      }
    });
  });
}

// 🧠 Mindmap Endpoint
app.post("/mindmap", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const transcript = await runTranscriptExtraction(url);
const prompt = `
Generate a hierarchical mindmap in valid JSON format for React Flow.

Important:
- Only include meaningful topics and subtopics from the transcript.
- Exclude any download logs, subtitles, file paths, or technical logs.
- Focus on conceptual topics such as AI, projects, learning resources, and tools.
- Use "nodes" and "edges" arrays for the output.
- Each node must have:
  - "id": unique string
  - "type": "default"
  - "data": { "label": "..." }
  - "position": { "x": ..., "y": ... } (non-overlapping positions; space nodes apart)
- Each edge must have:
  - "id": unique string
  - "source": source node id
  - "target": target node id
  - "animated": true
  - "style": { "stroke": "#FF6B6B", "strokeWidth": 2 } (for colorful animated edges)

IMPORTANT: Output ONLY the valid JSON object, no markdown, no explanation.
Transcript:
${transcript}

`;

    const result = await model.generateContent(prompt);
    res.json({ mindmap: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// 🚀 Xtended Advantage Endpoint
app.post("/xtended", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const transcript = await runTranscriptExtraction(url);
    const prompt = `
You are an expert content researcher.

Read this transcript and create a **list of additional, highly relevant points, tips, tools, or resources** related to the topic that would benefit the audience.  
These points can include advanced techniques, tools, workflows, or actionable advice that were not mentioned in the transcript, but are useful for viewers interested in this topic.

Rules:
1. Do NOT mention the transcript, video, or missing content.
2. Focus on delivering **standalone, practical, high-value content**.
3. Write in bullet points or numbered lists only.
4. Keep it concise and easy to copy-paste.

Here is the transcript:
${transcript}
`;
    const result = await model.generateContent(prompt);
    res.json({ extended: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// ❓ What Ifs? Endpoint
app.post("/whatifs", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    const transcript = await runTranscriptExtraction(url);
    const prompt = `
Imagine you are creating thought-provoking "What If" questions based on the core topic of this transcript.

Ignore technical logs or irrelevant data like download processes or subtitles.  
Focus only on the core subject of the transcript.

Generate a list of highly creative, insightful "What If" questions that explore:
- Alternative scenarios
- Possible future developments
- Ethical challenges
- Technical breakthroughs
- Learning applications

example What-If questions: What if this Method Fails? What if this technology becomes mainstream? What if this approach is applied in a different context?  What if this were applied at scale

Rules:
1. Do NOT mention the transcript, video, or downloading processes.
2. Focus only on useful, interesting questions related to the topic.
3. Format as a clean, numbered list for easy copy-paste.
4. Keep the questions clear and concise.

Here is the transcript:
${transcript}

`;
    const result = await model.generateContent(prompt);
    res.json({ whatifs: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});
