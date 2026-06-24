import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import QuickActions from "./QuickActions";
import InputBar from "./InputBar";
import { RefreshCw, FileText } from "lucide-react";

export default function ChatWindow({
  fileInfo,
  messages,
  isStreaming,
  onSendMessage,
  onNewChatClick
}) {
  const scrollRef = useRef(null);

  // Auto scroll down as new tokens/messages load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col h-[82vh] max-w-4xl mx-auto border border-zinc-800 bg-zinc-900/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-zinc-900 border-b border-zinc-850">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-2 bg-brand/10 text-brand rounded-xl flex-shrink-0 border border-brand/20">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2
              className="text-zinc-100 font-semibold text-sm md:text-base truncate max-w-[200px] sm:max-w-md"
              title={fileInfo.name}
            >
              {fileInfo.name}
            </h2>
            <div className="flex items-center gap-2 text-zinc-500 text-xs mt-0.5">
              <span className="px-1.5 py-0.25 bg-zinc-950 border border-zinc-800 rounded-md text-[10px] text-zinc-400 font-medium">
                {fileInfo.type}
              </span>
              <span>•</span>
              <span>{formatBytes(fileInfo.size)}</span>
              <span>•</span>
              <span>
                {fileInfo.pages}{" "}
                {fileInfo.type === "PowerPoint" ? "slides" : "pages"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onNewChatClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-850 hover:bg-zinc-800 rounded-xl transition-all border border-zinc-800 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          New Chat
        </button>
      </div>

      {/* Messages Scroll Zone */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-zinc-950/20"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="p-4.5 bg-brand/5 border border-brand/10 rounded-full">
              <FileText className="h-8.5 w-8.5 text-brand animate-pulse" />
            </div>
            <div>
              <h3 className="text-zinc-250 font-bold text-lg mb-1">
                Document Loaded Successfully!
              </h3>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                Ready to answer questions. Click a quick action or type a custom
                query to begin.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={index}
              message={msg}
              isTyping={msg.isStreamingPlaceholder}
            />
          ))
        )}
      </div>

      {/* Chat Actions & Inputs */}
      <div className="p-4 bg-zinc-900/60 border-t border-zinc-850 space-y-3">
        <QuickActions onActionClick={onSendMessage} disabled={isStreaming} />
        <InputBar onSendMessage={onSendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
