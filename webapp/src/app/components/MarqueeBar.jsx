"use client";

export default function MarqueeSection() {
  return (
    <section className="w-full my-6 bg-[#FFFBD6] border-y-2 border-black overflow-hidden">
      <div className="marquee-track">
        <div className="marquee-content">
          <span>Watch Less</span>
          <span>✨</span>
          <span>Video Wisdom</span>
          <span>✨</span>
          <span>Free Forever!!</span>
          <span>✨</span>
          <span>Fast & Fun !!</span>
          <span>✨</span>
          <span>AI-Powered</span>
          <span>✨</span>
          <span>Summarize</span>
          <span>✨</span>
          <span>Quick Recap</span>
          <span>✨</span>
          <span>Read & Relax</span>
          <span>✨</span>
        </div>
        <div
          className="marquee-content"
          aria-hidden="true"
        >
          <span>Watch Less</span>
          <span>✨</span>
          <span>Video Wisdom</span>
          <span>✨</span>
          <span>Free Forever!!</span>
          <span>✨</span>
          <span>Fast & Fun !!</span>
          <span>✨</span>
          <span>AI-Powered</span>
          <span>✨</span>
          <span>Summarize</span>
          <span>✨</span>
          <span>Quick Recap</span>
          <span>✨</span>
          <span>Read & Relax</span>
          <span>✨</span>
        </div>
      </div>
    </section>
  );
}
