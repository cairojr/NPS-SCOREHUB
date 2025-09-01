"use client";
import React from "react";
import { SparklesCore } from "./sparkles";
import { useTheme } from "next-themes";

export function AnimatedScoreHubLogo() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="w-full flex flex-col items-center justify-center mb-8 relative">
      {/* Background particles - completely transparent */}
      <div className="absolute inset-0 w-full h-32 -top-4">
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={400}
          className="w-full h-full"
          particleColor={isDark ? "#FFFFFF" : "#000000"}
        />
      </div>

      {/* Logo text - no background, only text */}
      <h1 className="md:text-6xl text-4xl lg:text-7xl font-bold text-center relative z-10 bg-gradient-to-r from-primary via-accent to-tertiary bg-clip-text text-transparent sparkle-title sparkle-glow hover:scale-105 transition-transform duration-300 cursor-default">
        SCORE HUB
      </h1>

      {/* Subtitle */}
      <p className="text-sm text-muted-foreground mt-2 animate-fade-in relative z-10">
        Sistema NPS Premium
      </p>
    </div>
  );
}