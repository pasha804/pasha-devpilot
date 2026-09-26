"use client";

import React, { useState } from "react";
import { Check, X, ShieldAlert, Edit3, ArrowRight } from "lucide-react";

interface ApprovalDialogProps {
  planMarkdown: string;
  onApprove: (editedPlan?: string) => void;
  onReject: () => void;
  isSubmitting?: boolean;
}

export function ApprovalDialog({
  planMarkdown,
  onApprove,
  onReject,
  isSubmitting = false,
}: ApprovalDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(planMarkdown);

  return (
    <div className="bg-[#0b1222] border-2 border-sky-500/50 rounded-xl p-5 shadow-2xl relative overflow-hidden">
      {/* Human In The Loop Accent Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1b2a47]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <ShieldAlert className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Human Approval Gate Checkpoint
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 font-mono">
                REQUIRED
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              DevPilot formulated an implementation plan. Review and authorize file modifications.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[#131f36] hover:bg-[#1a2c4e] text-slate-300 border border-[#23385e] transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-sky-400" />
          <span>{isEditing ? "View Rendered" : "Edit Plan"}</span>
        </button>
      </div>

      {/* Plan Content */}
      <div className="py-4 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
        {isEditing ? (
          <textarea
            value={editedPlan}
            onChange={(e) => setEditedPlan(e.target.value)}
            className="w-full h-64 p-3 bg-[#070b14] border border-[#1e2f4f] rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
          />
        ) : (
          <div className="prose prose-invert max-w-none text-xs whitespace-pre-wrap">
            {editedPlan}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[#1b2a47] flex items-center justify-between">
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span>Authorizing allows DevPilot to apply modifications to branch.</span>
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onReject}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel Plan</span>
          </button>

          <button
            onClick={() => onApprove(isEditing ? editedPlan : undefined)}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve Plan & Implement</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
