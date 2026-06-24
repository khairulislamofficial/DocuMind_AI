const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(), // File stays in RAM, no disk needed
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];
    const ext = file.originalname.split(".").pop().toLowerCase();
    const allowedExts = ["pdf", "docx", "pptx"];

    if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Only PDF, DOCX, and PPTX files are allowed."));
    }
  }
});

module.exports = upload;
