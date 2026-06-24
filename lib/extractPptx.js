const JSZip = require("jszip");

async function extractPptx(buffer) {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const slideTexts = [];

    // Filter slide XML files and sort them numerically so that slide10 doesn't come before slide2
    const filenames = Object.keys(zip.files)
      .filter((filename) => filename.match(/^ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0], 10);
        const numB = parseInt(b.match(/\d+/)[0], 10);
        return numA - numB;
      });

    for (const filename of filenames) {
      const xml = await zip.files[filename].async("text");
      // Basic tag replacement to extract raw text content
      const text = xml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (text) {
        slideTexts.push(text);
      }
    }

    return slideTexts.join("\n\n");
  } catch (error) {
    throw new Error(`Failed to extract text from PPTX: ${error.message}`);
  }
}

module.exports = { extractPptx };
