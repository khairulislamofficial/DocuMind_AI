const mammoth = require("mammoth");

async function extractDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

module.exports = { extractDocx };
