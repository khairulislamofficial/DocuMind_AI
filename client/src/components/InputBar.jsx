import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function InputBar({ onSendMessage, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Automatically grow height of textarea based on content length
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [text]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    // Send message on Enter without shift key, allow multi-line with shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <form
      onSubmit={handleSend}
      className="w-full flex items-end gap-2.5 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-inner focus-within:border-zinc-700 transition-colors"
    >
      <textarea
        ref={textareaRef}
        rows="1"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask any question about this document..."
        disabled={disabled}
        className="flex-1 max-h-[180px] resize-none bg-transparent py-1 px-2 text-zinc-100 text-sm md:text-base placeholder-zinc-500 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
          !text.trim() || disabled
            ? "bg-zinc-800 text-zinc-550 cursor-not-allowed"
            : "bg-brand text-white hover:bg-brand-dark cursor-pointer active:scale-95 shadow-md shadow-brand/10"
        }`}
      >
        <Send className="h-4.5 w-4.5" />
      </button>
    </form>
  );
}
