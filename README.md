# DocuMind AI 🧠📄

> **An intelligent, document-aware Q&A assistant powered by OpenAI GPT-4o-Mini.**  
> Upload a PDF, Word, or PowerPoint file and instantly ask questions, get summaries, extract key points, and more — all grounded in your specific document.

---

## ✨ Features

### Core (MVP)
| Feature | Description |
|---|---|
| 📤 **File Upload** | Drag-and-drop or browse — accepts PDF, DOCX, PPTX (max 20MB) |
| 🔍 **Text Extraction** | Parses and extracts raw text from all three formats |
| 💬 **Q&A Mode** | Ask any question — AI answers strictly from the document |
| 📝 **Summarize** | One-click document summary with bullet points |
| 🔑 **Key Takeaways** | Extracts the most important ideas automatically |
| 🔤 **Keyword Extraction** | Lists important terms and definitions from the document |
| 💡 **Explain Simply** | Rewrites complex concepts in plain language |
| 🔄 **New Chat** | Clears session and prompts for a fresh file upload |
| 📜 **Chat History** | Full multi-turn memory within a session |

### Advanced
| Feature | Description |
|---|---|
| ⚡ **Streaming Responses** | Tokens stream in real-time (no waiting for full replies) |
| 🧩 **Context Memory** | Maintains full conversation history within a session |
| 🎯 **Auto Topic Detection** | Adapts tone based on document type (legal, academic, etc.) |
| ⏱️ **Cold-Start Handling** | Server wake-up indicator for Render free tier |
| 🛡️ **Client + Server Validation** | File type and size enforced on both ends |

---

## 🏗️ Project Structure

```
DocuMind_AI/
│
├── server.js                  ← Express entry point; serves API + static frontend
├── package.json               ← Backend dependencies
├── .env.example               ← Environment variable template
├── REQUIREMENTS.md            ← Full dependency and setup requirements
│
├── routes/
│   ├── extract.js             ← POST /api/extract — uploads file, extracts text
│   └── chat.js                ← POST /api/chat   — streams OpenAI reply
│
├── middleware/
│   └── upload.js              ← Multer config (20MB limit, memory storage)
│
├── lib/
│   ├── extractPdf.js          ← pdf-parse wrapper
│   ├── extractDocx.js         ← mammoth wrapper
│   ├── extractPptx.js         ← jszip + XML slide parser (numerically sorted)
│   └── buildPrompt.js         ← Constructs OpenAI system prompt
│
├── tests/
│   └── testParsers.js         ← Unit tests for file extraction logic
│
└── client/                    ← React + Vite frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js          ← Dev proxy: /api → localhost:5000
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx             ← Core state machine (upload/chat flow)
        ├── index.css           ← Tailwind + custom scrollbars + animations
        └── components/
            ├── FileUploader.jsx   ← Drag-and-drop upload UI
            ├── ChatWindow.jsx     ← Chat interface container
            ├── MessageBubble.jsx  ← User/AI message rendering + Markdown parser
            ├── InputBar.jsx       ← Auto-resizing multi-turn text input
            └── QuickActions.jsx   ← Shortcut buttons (Summarize, Key Points, etc.)
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **Icons** | Lucide React |
| **Backend** | Node.js + Express 4 |
| **AI Model** | OpenAI `gpt-4o-mini` (128k context) |
| **PDF Parsing** | `pdf-parse` |
| **DOCX Parsing** | `mammoth` |
| **PPTX Parsing** | `jszip` (manual XML extraction) |
| **File Upload** | `multer` (RAM storage, 20MB limit) |
| **Deployment** | Render (Free Tier) |
| **Database** | None (stateless, session in React state) |

---

## 🚀 Getting Started — Local Development

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/documind-ai.git
cd documind-ai
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Open `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=5000
```

> 🔑 Get your API key at: https://platform.openai.com/api-keys

### Step 3: Install Backend Dependencies

```bash
npm install
```

### Step 4: Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### Step 5: Start the Backend Server

```bash
npm run dev
```

The backend will start on `http://localhost:5000`.

### Step 6: Start the Frontend Dev Server

In a **new terminal**:

```bash
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`** — API calls are automatically proxied to port 5000.

---

## 🏭 Production Build

To simulate the production environment locally (single server for frontend + backend):

```bash
# 1. Build the React frontend
cd client
npm run build
cd ..

# 2. Start the unified Express server
npm start
```

Open your browser at **`http://localhost:5000`**.

---

## ☁️ Deploying to Render

1. Push your project to a **GitHub repository** (don't commit `.env`)
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Set the following:

| Setting | Value |
|---|---|
| **Environment** | `Node` |
| **Build Command** | `npm install && cd client && npm install && npm run build` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

5. Add **Environment Variables** in the Render dashboard:
   - `OPENAI_API_KEY` = `sk-your-key-here`

6. Click **Create Web Service** — your app will be live in ~2–3 minutes.

> ⚠️ **Free Tier Note:** Render's free tier sleeps after 15 minutes of inactivity. The first request may take 30–50 seconds to wake up. The UI handles this gracefully with a "warming up..." indicator.

---

## 🔌 API Reference

### `GET /api/health`
Server health check and wake-up probe.

**Response:**
```json
{ "status": "ok", "message": "DocuMind Server is awake and ready!" }
```

---

### `POST /api/extract`
Upload a document file and receive extracted plain text.

**Request:** `multipart/form-data`
| Field | Type | Description |
|---|---|---|
| `file` | File | PDF, DOCX, or PPTX file (max 20MB) |

**Response:**
```json
{
  "text": "Extracted document text...",
  "fileInfo": {
    "name": "lecture_notes.pdf",
    "size": 204800,
    "type": "PDF",
    "wordCount": 3450,
    "pages": 12
  }
}
```

**Error Responses:**
- `400` — No file uploaded, unsupported file type, file too large, or no extractable text
- `500` — Internal parsing error

---

### `POST /api/chat`
Send a user message and receive a streamed AI reply.

**Request:** `application/json`
```json
{
  "extractedText": "Full document content as plain text...",
  "chatHistory": [
    { "role": "user", "content": "What is the main topic?" },
    { "role": "assistant", "content": "The document covers..." }
  ],
  "userMessage": "Can you give me more details on chapter 2?"
}
```

**Response:** Plain text stream (`Transfer-Encoding: chunked`)
- Tokens are written incrementally as they arrive from OpenAI
- The client reads them via `response.body.getReader()` for real-time rendering

**Error Responses:**
- `400` — Missing `extractedText` or `userMessage`
- `500` — Missing API key or OpenAI error

---

## 🖥️ UI/UX Design

### Color System
| Role | Color |
|---|---|
| Background | `#09090b` — Deep zinc black |
| Surface | `#18181b` — Dark card surface |
| Primary (Brand) | `#6366f1` — Indigo 500 |
| Brand Light | `#818cf8` — Indigo 400 |
| Text | `#f4f4f5` — Zinc 100 |
| Muted Text | `#71717a` — Zinc 500 |

### Typography
- **Font:** Inter (via Google Fonts)
- **Weights:** 300 (light), 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)

### Screens

**Upload Screen** — Landing view:
- Animated gradient logo
- Drag-and-drop zone with hover effects
- File format badges (PDF / DOCX / PPTX)
- Server connection status indicator
- Server warm-up alert (Render cold starts)

**Chat Screen** — Active session:
- File metadata header (name, type, size, pages/slides)
- Scrollable message list with auto-scroll
- User messages (indigo bubbles, right-aligned)
- AI messages (dark bubbles, left-aligned) with Markdown rendering
- Typing dots animation while streaming
- Quick action buttons (Summarize, Key Takeaways, Explain Simply, Keywords)
- Auto-resizing input bar (Enter to send, Shift+Enter for new line)
- New Chat button to reset session

---

## 🧪 Running Tests

```bash
# From the project root
node tests/testParsers.js
```

**Expected output:**
```
Starting unit tests for DocuMind Parsers...
Extracted text:
 Slide 1 content text

Slide 2 content text

Slide 10 content text
✅ PPTX Extractor test passed (including numerical sort verification)!
All tests completed successfully!
```

---

## 🔐 Security

- ✅ `OPENAI_API_KEY` stored only in environment variables — never in code
- ✅ File MIME type validated on both client and server side
- ✅ File size capped at 20MB via `multer`
- ✅ Extracted text is **never stored** on the server (fully stateless API)
- ✅ No user authentication required for MVP (each session is ephemeral)
- ⬜ (v2) Rate limiting per IP via Upstash Redis

---

## 💰 Cost Estimate (OpenAI)

Using `gpt-4o-mini` at $0.15/1M input tokens + $0.60/1M output tokens:

| Usage Level | Tokens/Month | Est. Cost |
|---|---|---|
| Personal/Testing | ~500k | **~$0.08** |
| Small (50 users) | ~5M | **~$0.80** |
| Medium (500 users) | ~50M | **~$8.00** |

**Extremely cost-effective for a deployed application.**

---

## 🗺️ Roadmap (v2)

| Feature | Technology |
|---|---|
| Save chat history across sessions | Supabase + Auth.js |
| Multiple file upload in one session | Merge extracted texts |
| OCR for scanned/image PDFs | OpenAI Vision or Tesseract.js |
| Voice input | Web Speech API |
| Export chat as PDF | jsPDF |
| Share chat link | Unique URL + Supabase |
| Rate limiting | Upstash Redis |
| Admin dashboard | Usage monitoring |

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🙌 Acknowledgements

- [OpenAI](https://openai.com) — `gpt-4o-mini` model
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) — PDF text extraction
- [mammoth](https://www.npmjs.com/package/mammoth) — DOCX conversion
- [JSZip](https://stuk.github.io/jszip/) — PPTX unzipping
- [Lucide React](https://lucide.dev/) — icon library
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [Vite](https://vitejs.dev/) — frontend tooling
- [Render](https://render.com/) — free-tier hosting
