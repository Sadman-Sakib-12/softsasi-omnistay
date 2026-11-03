import React from "react";

interface MarkdownContentProps {
  content?: string;
  className?: string;
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1.5 my-3 text-slate-600 pl-2">
          {listBuffer.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='bg-slate-100 text-[#00a8ff] px-1.5 py-0.5 rounded text-[11px] font-mono'>$1</code>");
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listBuffer.push(trimmed.substring(2));
      return;
    }

    flushList();

    if (!trimmed) {
      return;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={index} className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-6 mb-3">
          {trimmed.substring(2)}
        </h1>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-5 mb-2.5">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mt-4 mb-2">
          {trimmed.substring(4)}
        </h3>
      );
    } else if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote
          key={index}
          className="border-l-4 border-[#00a8ff] pl-4 py-1.5 my-3 bg-sky-50/50 text-slate-700 italic rounded-r-lg"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed.substring(2)) }}
        />
      );
    } else {
      elements.push(
        <p
          key={index}
          className="leading-relaxed text-slate-600 my-2"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
        />
      );
    }
  });

  flushList();

  return <div className={`prose-slate max-w-none text-xs sm:text-sm ${className}`}>{elements}</div>;
}

