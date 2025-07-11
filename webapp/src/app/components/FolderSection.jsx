"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Separator } from "../../components/ui/separator";

export default function FolderVideoPreview({ url }) {
  const [videoData, setVideoData] = useState(null);
  const [isHighRes, setIsHighRes] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(
            url
          )}&format=json`
        );
        if (!res.ok) throw new Error("Failed to fetch video data");
        const data = await res.json();

        const videoId = new URL(url).searchParams.get("v");
        const highRes = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        const test = await fetch(highRes);
        const thumbnailUrl = test.ok ? highRes : data.thumbnail_url;

        setIsHighRes(test.ok); // Set the flag
        setVideoData({ ...data, thumbnail_url: thumbnailUrl });
      } catch (err) {
        console.error(err);
      }
    };

    fetchVideoData();
  }, [url]);

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Folder Background */}
      <Image
        src="/File SVG.svg"
        alt="Folder Background"
        width={1600}
        height={900}
        className="w-full h-auto"
        priority
      />

      {videoData && (
        <>
          {/* Title & Author inside Yellow Section */}
          <div className="absolute left-[15%] top-[30%] w-[65%]">
            <h3 className="font-bold text-xl md:text-2xl text-black mb-2 underline underline-offset-4">
              {videoData.title}
            </h3>
            <p className="text-sm md:text-base text-gray-700">
              By {videoData.author_name}
            </p>
          </div>

          <div className="absolute left-[15%] top-[43%] w-[22%]">
            <p className="text-left text-black font-semibold text-xl">
              Generating AI Summaries with Mind Maps, Xtended Thinking &
              What-Ifs
            </p>
            <p className="text-left mt-2">
              <span className="text-sm text-gray-800">
                Unlock deeper insights from YouTube videos! This tool generates
                concise AI-powered summaries, interactive mind maps, extended
                thinking points, and "What-If" explorations to help you learn
                smarter.
              </span>
            </p>
            <Separator className="my-2 bg-gray-800 " />
            <p className="text-left text-gray-800">
              <span className="text-sm">Gathering thoughts, please wait…</span>
            </p>
          </div>

          {/* Video Thumbnail inside Purple Box Section */}
          <div
            className={`absolute rounded-4xl border border-black shadow-lg ${
              isHighRes
                ? "right-[12%] top-[44%] w-[48%]" // Slightly reposition for maxres
                : "right-[15%] top-[40%] w-[43%]"
            }`}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src={videoData.thumbnail_url}
                alt="Video Thumbnail"
                width={640}
                height={360}
                className="rounded-4xl border border-black shadow-lg w-full h-auto cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
