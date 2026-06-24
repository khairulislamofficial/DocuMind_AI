import React from "react";
import { User, Sparkles } from "lucide-react";

// Robust, lightweight parser for standard markdown features (bold, lists, code)
function formatMarkdown(text) {
  if (!text) return "";

  // Escape basic HTML to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks: ```lang\ncode\n```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="my-3 p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-x-auto font-mono text-xs md:text-sm text-zinc-300"><code>${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 bg-zinc-950 text-brand-light font-mono text-xs md:text-sm rounded border border-zinc-800/60">$1</code>'
  );

  // Bold: **text**
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-semibold text-white">$1</strong>'
  );

  // Lists: group consecutive lines starting with "- " or "* "
  const lines = html.split("\n");
  let inList = false;
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.substring(2);
      let prefix = "";
      if (!inList) {
        inList = true;
        prefix = '<ul class="list-disc pl-5 my-2 space-y-1.5 text-zinc-300">';
      }
      return `${prefix}<li>${content}</li>`;
    } else {
      let suffix = "";
      if (inList) {
        inList = false;
        suffix = "</ul>";
      }
      return suffix + line;
    }
  });

  if (inList) {
    processedLines.push("</ul>");
  }

  html = processedLines.join("\n");

  // Spacing and paragraph lines
  html = html.replace(/\n\n/g, '<div class="h-3"></div>');
  html = html.replace(/\n/g, "<br />");

  return html;
}

export default function MessageBubble({ message, isTyping }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3.5 w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="h-8.5 w-8.5 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles className="h-4.5 w-4.5 text-brand" />
        </div>
      )}

      {/* Text Bubble */}
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed ${
          isUser
            ? "bg-brand text-white rounded-tr-none border border-brand-dark/30 shadow-md"
            : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none shadow-sm"
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-1 py-1 px-0.5">
            <span className="h-2 w-2 rounded-full bg-zinc-500 animate-dot-1"></span>
            <span className="h-2 w-2 rounded-full bg-zinc-500 animate-dot-2"></span>
            <span className="h-2 w-2 rounded-full bg-zinc-500 animate-dot-3"></span>
          </div>
        ) : (
          <div
            className="prose prose-invert max-w-none text-zinc-200 break-words"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
          />
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="h-8.5 w-8.5 rounded-xl bg-zinc-850 border border-zinc-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <User className="h-4.5 w-4.5 text-zinc-300" />
        </div>
      )}
    </div>
  );
}
