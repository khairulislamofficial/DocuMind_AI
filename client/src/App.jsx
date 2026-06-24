import React, { useState, useEffect } from "react";
import FileUploader from "./components/FileUploader";
import ChatWindow from "./components/ChatWindow";
import { Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";

export default function App() {
  const [view, setView] = useState("upload"); // 'upload' or 'chat'
  const [fileInfo, setFileInfo] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isServerWarming, setIsServerWarming] = useState(true);

  // Probe backend status and clear cold-start sleep states
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          setIsServerWarming(false);
        } else {
          setTimeout(checkServer, 3000);
        }
      } catch (err) {
        setTimeout(checkServer, 3000);
      }
    };
    checkServer();
  }, []);

  const handleUploadSuccess = (text, info) => {
    setExtractedText(text);
    setFileInfo(info);
    setMessages([]);
    setView("chat");
  };

  const handleNewChat = () => {
    setExtractedText("");
    setFileInfo(null);
    setMessages([]);
    setView("upload");
  };

  const handleSendMessage = async (userMessage) => {
    if (!userMessage.trim() || isStreaming) return;

    // Cache pre-message list for backend chat history context
    const previousHistory = [...messages];

    // Append user input
    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage }
    ];
    setMessages(updatedMessages);
    setIsStreaming(true);

    // Append typing bubble
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", isStreamingPlaceholder: true }
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          extractedText,
          chatHistory: previousHistory,
          userMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to communicate with OpenAI");
      }

      // Stream handling
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completeResponse = "";

      // Swap out typing indicator for live answer bubble
      setMessages((prev) => {
        const nextList = [...prev];
        nextList[nextList.length - 1] = { role: "assistant", content: "" };
        return nextList;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        completeResponse += textChunk;

        setMessages((prev) => {
          const nextList = [...prev];
          nextList[nextList.length - 1] = {
            role: "assistant",
            content: completeResponse
          };
          return nextList;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const nextList = [...prev];
        nextList[nextList.length - 1] = {
          role: "assistant",
          content: `⚠️ Error: ${err.message || "Failed to generate completion."}`
        };
        return nextList;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-zinc-900 bg-zinc-950/30 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand/10 border border-brand/20 text-brand">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-zinc-100 font-bold text-lg md:text-xl tracking-tight">
            DocuMind <span className="text-brand">AI</span>
          </span>
        </div>

        {/* Server Status Banner */}
        <div>
          {isServerWarming ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium animate-pulse">
              <RefreshCw className="h-3 w-3 text-indigo-400 animate-spin" />
              Warming up server...
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Server Connected
            </div>
          )}
        </div>
      </header>

      {/* Main Panel View router */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        {view === "upload" ? (
          <FileUploader
            onUploadSuccess={handleUploadSuccess}
            isServerWarming={isServerWarming}
          />
        ) : (
          <ChatWindow
            fileInfo={fileInfo}
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            onNewChatClick={handleNewChat}
          />
        )}
      </main>
    </div>
  );
}
