const { extractPptx } = require("../lib/extractPptx");
const JSZip = require("jszip");

async function runTests() {
  console.log("Starting unit tests for DocuMind Parsers...");

  // Test PPTX Extractor
  try {
    const zip = new JSZip();
    // Intentionally add out of order slide2, slide1, slide10 to test natural numerical sorting logic
    zip.file("ppt/slides/slide2.xml", "<w:t>Slide 2 content text</w:t>");
    zip.file("ppt/slides/slide1.xml", "<w:t>Slide 1 content text</w:t>");
    zip.file("ppt/slides/slide10.xml", "<w:t>Slide 10 content text</w:t>");

    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    const text = await extractPptx(buffer);

    console.log("Extracted text:\n", text);

    const expected =
      "Slide 1 content text\n\nSlide 2 content text\n\nSlide 10 content text";

    if (text.trim() === expected) {
      console.log("✅ PPTX Extractor test passed (including numerical sort verification)!");
    } else {
      console.error(
        `❌ PPTX Extractor test failed.\nExpected: "${expected}"\nGot: "${text}"`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ PPTX Extractor test encountered an error:", error);
    process.exit(1);
  }

  console.log("All tests completed successfully!");
}

runTests();
