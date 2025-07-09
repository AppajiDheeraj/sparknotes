# 🔧 SparkNotes — Backend (API Server)

This folder contains the **backend** for SparkNotes, which handles video summarization, mindmap generation, extended thinking, and what-ifs using AI-powered APIs.

> ✅ Deployed on [Render](https://sparknotes-s58d.onrender.com)

---

## 🚀 Tech Stack
- Node.js (Express)
- Python (summarizer.py)
- fetch API
- JSON-based APIs

---

## 📂 API Endpoints

| Route            | Description                            |
|------------------|----------------------------------------|
| `/summarize`     | Summarizes a YouTube video              |
| `/mindmap`       | Generates a MindMap based on summary    |
| `/xtended`       | Provides extended thinking insights     |
| `/whatifs`       | Generates "What If?" hypothetical cases |

---

## 📦 Setup
```bash
# Install Node dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

▶️ Running Locally
```bash
# Start the server
npm start
```

---

## 📁 Directory Structure
```bash
backend/
├── cookies.txt           # (Optional) For authentication if needed
├── package.json          # Node.js dependencies
├── requirements.txt      # Python dependencies
├── server.js             # Main API server
├── summarizer.py         # Video summarization script
ℹ️ Note: output.en.json3 is a temporary file and not tracked.
```

---

## 📝 Notes
This backend is intended to work with the frontend inside the /webapp folder.
You can easily deploy it on Render or any Node-supported environment.

---
<div align="center">
  ❤️ Made with love by AppajiDheeraj
</div>
