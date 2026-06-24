const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { extractPdf } = require("../lib/extractPdf");
const { extractDocx } = require("../lib/extractDocx");
const { extractPptx } = require("../lib/extractPptx");

// Wrap multer in a Promise so async/await works correctly inside the route
function runMulter(req, res) {
  return new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

router.post("/", async (req, res) => {
  try {
    // Run multer upload (awaitable)
    await runMulter(req, res);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const originalname = req.file.originalname;
    const ext = originalname.split(".").pop().toLowerCase();

    let text = "";
    let pagesCount = 1;
    let docType = "Document";

    if (mimetype === "application/pdf" || ext === "pdf") {
      // extractPdf already uses pdf-parse internally — no double parse
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      text = data.text.trim();
      pagesCount = data.numpages || 1;
      docType = "PDF";

    } else if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    ) {
      text = await extractDocx(buffer);
      docType = "Word Document";
      const words = text.split(/\s+/).filter(Boolean).length;
      pagesCount = Math.max(1, Math.ceil(words / 450));

    } else if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      ext === "pptx"
    ) {
      text = await extractPptx(buffer);
      docType = "PowerPoint";
      const slides = text.split("\n\n").filter(Boolean).length;
      pagesCount = slides || 1;

    } else {
      return res.status(400).json({ error: "Unsupported file type. Upload PDF, DOCX, or PPTX only." });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: "No readable text found. Make sure the file is not empty or image-only."
      });
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    return res.json({
      text,
      fileInfo: {
        name: originalname,
        size: req.file.size,
        type: docType,
        wordCount,
        pages: pagesCount
      }
    });

  } catch (error) {
    console.error("Extract route error:", error.message);
    // Always return JSON — never let the response be empty
    if (!res.headersSent) {
      return res.status(500).json({
        error: error.message || "Failed to process the uploaded file."
      });
    }
  }
});

module.exports = router;
