"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

export const HeroSection = ({ onSummaryGenerated, onLoadingChange, url, setUrl }) => {
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    if (!url) return;
    window.currentUrl = url; // Save current URL for later use

    onLoadingChange?.(true);
    setError("");

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (res.ok && data.summary) {
        onSummaryGenerated?.(data.summary);
      } else {
        setError(data.error || "Failed to summarize video.");
        onLoadingChange?.(false);
      }
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
      onLoadingChange?.(false);
    }
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-6 md:px-12">
      {/* Left Section - SVG Illustration (Hidden on Mobile) */}
      <div className="hidden md:block">
        <Image
          src="/Hero.svg"
          alt="Hero Illustration"
          width={650}
          height={600}
          className="h-auto"
          priority
        />
      </div>

      {/* Right Section - Text + Input */}
      <div className="flex flex-col items-center md:items-start mt-6 md:mt-0 text-center md:text-left gap-6">
        {/* Headline */}
        <h1
          className="relative text-5xl md:text-7xl leading-tight text-black"
          style={{ fontFamily: "Fredoka One, sans-serif" }}
        >
          Turn Hours of <br /> YouTube into
          <span className="absolute top-32 left-92 translate-x-1/2">
            <Image
              src="/FreeTag.svg"
              alt="Free Tag"
              width={200}
              height={200}
              className="w-30 h-20 rotate-[25deg]"
            />
          </span>
          Minutes
        </h1>

        {/* Descriptive Paragraph */}
        <div className="relative">
          <div className="absolute left-0 top-0 h-full w-1 bg-black/50 rounded-full"></div>
          <p className="pl-4 text-sm md:text-lg text-black max-w-md md:max-w-lg leading-relaxed">
            Stop wasting time. Instantly summarize YouTube videos into fun,
            easy-to-digest key points. No more fluff—just pure value!
          </p>
        </div>

        {/* Trusted By Section */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/AppajiDheeraj.png"
                alt="@AppajiDheeraj"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="" alt="@guest" />
              <AvatarFallback>GS</AvatarFallback>
            </Avatar>
          </div>
          <p className="text-gray-600 text-xs md:text-sm">
            Trusted by <span className="font-semibold">100+</span> creators &
            learners
          </p>
        </div>

        {/* Input + Button */}
        <div className="flex w-full max-w-md rounded-full border border-black overflow-hidden bg-[#FFFBD6]">
          <input
            type="text"
            placeholder="Paste a YouTube URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSummarize()}
            className="flex-grow px-4 py-3 text-black placeholder:text-gray-600 focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={handleSummarize}
            disabled={!url}
            style={{ fontFamily: "Fredoka One, sans-serif" }}
            className="bg-[#5C3BFE] hover:bg-[#4B2ED1] disabled:bg-gray-400 text-white px-6 py-3 rounded-full transition-colors"
          >
            GO
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-red-600 text-sm max-w-md">
            {error}
          </div>
        )}
      </div>
    </section>
  );
};