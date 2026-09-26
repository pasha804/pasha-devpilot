"use client";

import React, { useState } from "react";
import { Folder, FolderOpen, FileCode, FileText, ChevronRight, ChevronDown, Lock } from "lucide-react";
import { FileTreeNode } from "@/lib/api";

interface FileTreeProps {
  nodes: FileTreeNode[];
  onSelectFile: (path: string) => void;
  selectedFilePath?: string;
}

export function FileTree({ nodes, onSelectFile, selectedFilePath }: FileTreeProps) {
  return (
    <div className="text-xs select-none space-y-0.5 font-mono">
      {nodes.map((node) => (
        <FileTreeNodeItem
          key={node.path}
          node={node}
          onSelectFile={onSelectFile}
          selectedFilePath={selectedFilePath}
          depth={0}
        />
      ))}
    </div>
  );
}

function FileTreeNodeItem({
  node,
  onSelectFile,
  selectedFilePath,
  depth,
}: {
  node: FileTreeNode;
  onSelectFile: (path: string) => void;
  selectedFilePath?: string;
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(depth === 0 || depth === 1);
  const isSelected = selectedFilePath === node.path;

  if (node.is_dir) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#152035] text-slate-300 transition-colors text-left`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
          {isOpen ? (
            <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-sky-500/80" />
          )}
          <span className="truncate font-medium">{node.name}</span>
        </button>

        {isOpen && node.children && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <FileTreeNodeItem
                key={child.path}
                node={child}
                onSelectFile={onSelectFile}
                selectedFilePath={selectedFilePath}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File leaf
  return (
    <button
      onClick={() => onSelectFile(node.path)}
      className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
        isSelected
          ? "bg-sky-500/20 text-sky-300 font-semibold border-l-2 border-sky-400"
          : "hover:bg-[#121c2e] text-slate-400 hover:text-slate-200"
      }`}
      style={{ paddingLeft: `${depth * 14 + 20}px` }}
    >
      <div className="flex items-center gap-1.5 overflow-hidden">
        {node.is_sensitive ? (
          <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        ) : node.name.endsWith(".py") || node.name.endsWith(".ts") || node.name.endsWith(".tsx") || node.name.endsWith(".js") ? (
          <FileCode className="w-3.5 h-3.5 text-sky-400/80 flex-shrink-0" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {node.is_sensitive && (
        <span className="text-[9px] px-1 bg-amber-950 text-amber-300 border border-amber-800 rounded">
          EXCLUDED
        </span>
      )}
    </button>
  );
}
