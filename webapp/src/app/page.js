"use client";

import FileIcon from "./components/FolderSection";
import FooterSection from "./components/Footer";
import HeaderSection from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import LazySection from "./components/Lazy-Section";
import MarqueeSection from "./components/MarqueeBar";
import SummaryBox from "./components/SummaryBox";
import { useState } from "react";

export default function Home() {
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummaryGenerated = (newSummary) => {
    setSummary(newSummary);
    setLoading(false);
  };

  const handleSummaryLoading = (isLoading) => {
    setLoading(isLoading);
    if (isLoading) {
      setSummary(""); // Clear previous summary when starting new request
    }
  };
  return (
    <div>
      <HeaderSection />
      <HeroSection
        onSummaryGenerated={handleSummaryGenerated}
        onLoadingChange={handleSummaryLoading}
        url={url}
        setUrl={setUrl}
        loading={loading}
      />
      {url && <FileIcon url={url} />}
      {url && <SummaryBox summary={summary} loading={loading} />}
      <MarqueeSection />
      <LazySection />
      <FooterSection />
    </div>
  );
}
