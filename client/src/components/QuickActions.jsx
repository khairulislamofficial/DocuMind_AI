import React from "react";
import { FileText, Compass, Zap, HelpCircle } from "lucide-react";

export default function QuickActions({ onActionClick, disabled }) {
  const actions = [
    {
      label: "Summarize",
      prompt: "Summarize this document in a concise, structured way.",
      icon: FileText,
      color: "hover:border-indigo-500 hover:text-indigo-400"
    },
    {
      label: "Key Takeaways",
      prompt:
        "Extract the primary key takeaways and core ideas from this document as bullet points.",
      icon: Zap,
      color: "hover:border-violet-500 hover:text-violet-400"
    },
    {
      label: "Explain Simply",
      prompt:
        "Explain the main concepts of this document in simple terms, using easy analogies if possible.",
      icon: Compass,
      color: "hover:border-purple-500 hover:text-purple-400"
    },
    {
      label: "Keywords & Terms",
      prompt:
        "Extract the most important technical keywords, acronyms, or specific terminology used in this document with brief definitions or context.",
      icon: HelpCircle,
      color: "hover:border-fuchsia-500 hover:text-fuchsia-400"
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 py-3 px-1 border-t border-zinc-900 justify-center">
      {actions.map((act, index) => {
        const Icon = act.icon;
        return (
          <button
            key={index}
            onClick={() => onActionClick(act.prompt)}
            disabled={disabled}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 transition-all duration-200 ${
              disabled
                ? "opacity-40 cursor-not-allowed"
                : `cursor-pointer ${act.color} active:scale-95`
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {act.label}
          </button>
        );
      })}
    </div>
  );
}
