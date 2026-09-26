"use client";

import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (val: string) => void;
  height?: string;
}

export function CodeEditor({
  value,
  language = "python",
  readOnly = true,
  onChange,
  height = "100%",
}: CodeEditorProps) {
  // Map common languages
  let lang = language.toLowerCase();
  if (lang.includes("python")) lang = "python";
  else if (lang.includes("typescript") || lang.includes("tsx")) lang = "typescript";
  else if (lang.includes("javascript") || lang.includes("jsx")) lang = "javascript";
  else if (lang.includes("json")) lang = "json";
  else if (lang.includes("markdown")) lang = "markdown";

  return (
    <div className="w-full h-full border border-[#1a253c] rounded-md overflow-hidden bg-[#0a0e17]">
      <Editor
        height={height}
        theme="vs-dark"
        language={lang}
        value={value}
        onChange={(v) => onChange && onChange(v || "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: "all",
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
