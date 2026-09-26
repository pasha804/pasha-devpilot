"use client";

import React from "react";
import Link from "next/link";

interface DevPilotLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  clickable?: boolean;
  className?: string;
}

export function DevPilotLogo({
  size = "md",
  showText = true,
  clickable = true,
  className = "",
}: DevPilotLogoProps) {
  const iconDimensions = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-14 h-14",
  }[size];

  const textDimensions = {
    sm: "text-sm font-bold tracking-tight",
    md: "text-base font-extrabold tracking-tight",
    lg: "text-lg font-extrabold tracking-tight",
    xl: "text-2xl font-black tracking-tight",
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Cinematic Stylized 'P' Icon matching design */}
      <div className={`relative ${iconDimensions} shrink-0 drop-shadow-[0_0_12px_rgba(0,180,255,0.45)]`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="pasha-brand-p" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <filter id="p-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284C7" floodOpacity="0.5" />
            </filter>
          </defs>
          <path
            d="M7 6C7 4.34315 8.34315 3 10 3H21.5C26.7467 3 31 7.25329 31 12.5C31 17.7467 26.7467 22 21.5 22H14.5V31C14.5 32.1046 13.6046 33 12.5 33H9C7.89543 33 7 32.1046 7 31V6ZM14.5 8.5V16.5H21C23.2091 16.5 25 14.7091 25 12.5C25 10.2909 23.2091 8.5 21 8.5H14.5Z"
            fill="url(#pasha-brand-p)"
            filter="url(#p-glow)"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`text-white ${textDimensions}`}>
            Pasha DevPilot
          </span>
        </div>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
