"use client";

import React from "react";
import { BeatLoader } from "react-spinners";

export interface AppLoaderProps {
  color?: string;
  size?: number;
  speedMultiplier?: number;
  className?: string;
  text?: string;
  fullPage?: boolean;
}

export function AppLoader({
  color = "#22d3ee",
  size = 18,
  speedMultiplier = 1.2,
  className = "",
  text,
  fullPage = false,
}: AppLoaderProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <BeatLoader color={color} size={size} speedMultiplier={speedMultiplier} />
      {text && <p className="text-xs font-semibold text-slate-500 animate-pulse">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center p-8">
        {content}
      </div>
    );
  }

  return content;
}

export { BeatLoader };
export default AppLoader;
