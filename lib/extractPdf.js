const pdfParse = require("pdf-parse");

async function extractPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

module.exports = { extractPdf };
