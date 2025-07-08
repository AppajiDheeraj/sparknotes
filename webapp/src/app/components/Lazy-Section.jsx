"use client";
import Image from "next/image";

export default function LazySection() {
  return (
    <section className="w-full bg-[#FFFBD6] pt-12 flex flex-col items-center gap-16 text-center">
      {/* Steps Section */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-16">
        {/* Step #1 */}
        <div className="relative flex flex-col items-center">
          {/* Main Box */}
          <div className="bg-[#66e179] border border-black rounded-[30px] w-62 h-74 p-3 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Character peeking from corner */}
            <Image
              src="/2.svg"
              alt="Peek Character"
              width={110}
              height={50}
              className="absolute -bottom-2 -left-6"
            />
            <div className="flex flex-col items-center -mt-16">
              <p className="text-center text-black font-semibold text-lg">
                Quick Video Digest
              </p>
              <p>
                <span className="text-sm text-gray-800">
                  Your instant takeaway from the video! Skim through this
                  summary to get the essential points, saving time while still
                  learning effectively.
                </span>
              </p>
            </div>
          </div>
          {/* Step Circle (overlapping) */}
          <div className="absolute -top-6 bg-black text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-extrabold border-4 border-[#FFFBD6]">
            #1
          </div>
        </div>

        {/* Middle Hand/Button */}
        <div className="relative flex flex-col">
          <Image
            src="/4.svg"
            alt="Hand Illustration"
            width={700}
            height={700}
          />
          <h2
            style={{ fontFamily: "Fredoka One, sans-serif" }}
            className="absolute left-1 right-1 top-24 text-xl md:text-4xl leading-snug max-w-xl mx-auto"
          >
            Go search your YouTube video <br /> we&apos;ll handle the hard part!
          </h2>
        </div>

        {/* Step #2 */}
        <div className="relative flex flex-col items-center">
          {/* Main Box */}
          <div className="bg-[#66e179] border border-black rounded-[30px] w-62 h-74 p-4 relative overflow-hidden flex flex-col items-center justify-center">
            <Image
              src="/3.svg"
              alt="Peek Character"
              width={130}
              height={100}
              className="absolute -bottom-4 -left-8"
            />
            <p className="text-center text-black font-semibold text-lg">
              Mind Map & Extended Thinking
            </p>
            <p>
              <span className="text-sm text-gray-800">
                Get a mind map and extended thinking points to explore the topic
                further.Use the mind map to visualize key concepts and
                connections.
              </span>
            </p>
          </div>
          {/* Step Circle */}
          <div className="absolute -top-6 bg-black text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-extrabold border-4 border-[#FFFBD6]">
            #2
          </div>
        </div>
      </div>
    </section>
  );
}
