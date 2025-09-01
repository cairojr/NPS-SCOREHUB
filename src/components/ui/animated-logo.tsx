"use client";
import React from "react";
import { SparklesCore } from "./sparkles";
import { useTheme } from "next-themes";

export function AnimatedScoreHubLogo() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden rounded-md mb-8 bg-transparent">
      <h1 className="md:text-6xl text-4xl lg:text-7xl font-bold text-center relative z-20 bg-gradient-to-r from-primary via-accent to-tertiary bg-clip-text text-transparent sparkle-title sparkle-glow hover:scale-105 transition-transform duration-300 cursor-default">
        SCORE HUB
      </h1>
      <div className="w-full max-w-md h-20 relative mt-4 bg-transparent">
        {/* Gradients - Adapts to theme */}
        <div className={`absolute inset-x-8 top-0 ${
          isDark 
            ? "bg-gradient-to-r from-transparent via-blue-400 to-transparent" 
            : "bg-gradient-to-r from-transparent via-blue-600 to-transparent"
        } h-[2px] w-3/4 blur-sm`} />
        <div className={`absolute inset-x-8 top-0 ${
          isDark 
            ? "bg-gradient-to-r from-transparent via-blue-400 to-transparent" 
            : "bg-gradient-to-r from-transparent via-blue-600 to-transparent"
        } h-px w-3/4`} />
        <div className={`absolute inset-x-20 top-0 ${
          isDark 
            ? "bg-gradient-to-r from-transparent via-purple-400 to-transparent" 
            : "bg-gradient-to-r from-transparent via-purple-600 to-transparent"
        } h-[3px] w-1/2 blur-sm`} />
        <div className={`absolute inset-x-20 top-0 ${
          isDark 
            ? "bg-gradient-to-r from-transparent via-purple-400 to-transparent" 
            : "bg-gradient-to-r from-transparent via-purple-600 to-transparent"
        } h-px w-1/2`} />

        {/* Core sparkles component with transparent background */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={800}
          className="w-full h-full bg-transparent"
          particleColor={isDark ? "#FFFFFF" : "#000000"}
        />
      </div>

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
        Sistema NPS Premium
      </p>
    </div>
  );
}