"use client";

import React, { useState, useMemo } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { Check, Undo2, AlertTriangle, FileCode, Split, AlignJustify, PlusCircle, MinusCircle } from "lucide-react";

interface DiffViewerProps {
  original: string;
  modified: string;
  filePath: string;
  language?: string;
  explanation?: string;
  onAccept?: () => void;
  onRevert?: () => void;
}

export function DiffViewer({
  original,
  modified,
  filePath,
  language = "python",
  explanation,
  onAccept,
  onRevert,
}: DiffViewerProps) {
  const [inlineView, setInlineView] = useState(false);

  // Compute additions and deletions
  const { additions, deletions } = useMemo(() => {
    const origLines = original.split("\n");
    const modLines = modified.split("\n");
    let adds = 0;
    let dels = 0;

    // Fast approximation of additions/deletions count
    if (origLines.length !== modLines.length) {
      if (modLines.length > origLines.length) adds += (modLines.length - origLines.length);
      else dels += (origLines.length - modLines.length);
    }
    // Count line differences
    const origSet = new Set(origLines.map(l => l.trim()));
    const modSet = new Set(modLines.map(l => l.trim()));
    for (const l of modLines) {
      if (l.trim() && !origSet.has(l.trim())) adds++;
    }
    for (const l of origLines) {
      if (l.trim() && !modSet.has(l.trim())) dels++;
    }
    return { additions: Math.max(adds, 1), deletions: Math.max(dels, 1) };
  }, [original, modified]);

  // Map language
  let lang = language.toLowerCase();
  if (lang.includes("python")) lang = "python";
  else if (lang.includes("typescript") || lang.includes("tsx")) lang = "typescript";
  else if (lang.includes("javascript")) lang = "javascript";

  return (
    <div className="flex flex-col h-full bg-[#0a0f1c] border border-[#1e2e4a] rounded-xl overflow-hidden shadow-lg">
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-[#0e1628] border-b border-[#1e2e4a] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-4 h-4 text-sky-400" />
          <span className="font-mono text-xs font-semibold text-slate-200">{filePath}</span>

          {/* Section 30: +additions -deletions badges */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-semibold flex items-center gap-0.5">
              +{additions}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-400 border border-rose-800 font-semibold flex items-center gap-0.5">
              -{deletions}
            </span>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
            PROPOSED DIFF
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle inline/side-by-side */}
          <button
            onClick={() => setInlineView(!inlineView)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-[#152238] hover:bg-[#1c2c47] text-slate-300 border border-[#24375a] transition-colors"
          >
            {inlineView ? <Split className="w-3.5 h-3.5" /> : <AlignJustify className="w-3.5 h-3.5" />}
            <span>{inlineView ? "Side by Side" : "Inline Diff"}</span>
          </button>

          {onRevert && (
            <button
              onClick={onRevert}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Revert Changes</span>
            </button>
          )}

          {onAccept && (
            <button
              onClick={onAccept}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Diff</span>
            </button>
          )}
        </div>
      </div>

      {/* Explanation Banner */}
      {explanation && (
        <div className="px-4 py-2 bg-[#0d1424] border-b border-[#1a253c] text-xs text-slate-300 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong className="text-amber-300">AI Context:</strong> {explanation}
          </span>
        </div>
      )}

      {/* Monaco Diff Editor */}
      <div className="flex-1 min-h-[350px]">
        <DiffEditor
          height="100%"
          theme="vs-dark"
          language={lang}
          original={original}
          modified={modified}
          options={{
            readOnly: true,
            renderSideBySide: !inlineView,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', Consolas, 'Courier New', monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
