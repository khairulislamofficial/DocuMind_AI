import React, { useState, useRef } from "react";
import { Upload, FileText, AlertTriangle, RefreshCw } from "lucide-react";

export default function FileUploader({ onUploadSuccess, isServerWarming }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;

    // Validate size (20MB)
    const limit = 20 * 1024 * 1024;
    if (file.size > limit) {
      setError("File exceeds the 20MB size limit.");
      return;
    }

    // Validate extensions
    const ext = file.name.split(".").pop().toLowerCase();
    const allowed = ["pdf", "docx", "pptx"];
    if (!allowed.includes(ext)) {
      setError("Unsupported file format. Please upload PDF, DOCX, or PPTX.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData
      });

      // Safely parse JSON — avoid crashing if server returns empty body
      let data = {};
      const rawText = await response.text();
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Server error (status ${response.status}). Check that the backend is running.`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to process file");
      }

      onUploadSuccess(data.text, data.fileInfo);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while parsing the file.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-brand animate-ping"></span>
            Powered by Gemini 2.0 Flash
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3 bg-gradient-to-r from-brand-light via-brand to-violet-500 bg-clip-text text-transparent">
            DocuMind AI
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto">
            Your document-aware Q&A companion. Upload a file to instantly query
            and digest it.
          </p>
        </div>

        {/* Server cold-start notification */}
        {isServerWarming && (
          <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-brand/10 border border-brand/20 rounded-xl text-zinc-300 text-xs md:text-sm">
            <RefreshCw className="h-4.5 w-4.5 text-brand animate-spin flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-brand-light">
                Backend Server is warming up...
              </span>{" "}
              It may take up to a minute to start due to Render's free tier inactivity
              rules. Please wait.
            </div>
          </div>
        )}

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={loading || isServerWarming ? undefined : onButtonClick}
          className={`relative group border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
            isDragActive
              ? "border-brand bg-brand/5 shadow-[0_0_20px_rgba(99,102,241,0.05)]"
              : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50"
          } ${
            loading || isServerWarming
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "cursor-pointer"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.pptx"
            onChange={handleChange}
            disabled={loading || isServerWarming}
          />

          <div className="flex flex-col items-center justify-center space-y-5">
            {loading ? (
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-900/20 border-t-brand animate-spin"></div>
                <FileText className="absolute h-6 w-6 text-brand-light" />
              </div>
            ) : (
              <div className="p-4 bg-zinc-950 rounded-2xl group-hover:scale-105 transition-transform duration-300 border border-zinc-800 group-hover:border-zinc-700">
                <Upload className="h-8 w-8 text-brand" />
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-zinc-200 font-semibold text-base">
                {loading
                  ? "Extracting text content..."
                  : "Drag & drop your document here"}
              </p>
              {!loading && (
                <p className="text-zinc-400 text-xs md:text-sm">
                  or{" "}
                  <span className="text-brand font-medium group-hover:text-brand-light transition-colors">
                    browse files
                  </span>
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-center gap-4 text-zinc-500 text-xs">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> PDF
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> DOCX
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> PPTX
              </span>
              <span className="h-3.5 w-px bg-zinc-800"></span>
              <span>Max 20MB</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-red-950/20 border border-red-900/30 rounded-xl text-red-200 text-xs md:text-sm">
            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="break-words">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
