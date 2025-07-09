"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import Image from "next/image";
import { Separator } from "../../components/ui/separator";

export default function HeaderSection() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex justify-between items-center px-4 mt-2 md:mt-0 md:px-12">
      {/* Left: Menu Button */}
      <button
        onClick={() => setMenuOpen(true)}
        className="flex items-center border bg-white border-black rounded-full overflow-hidden shadow-md"
      >
        <div className="bg-yellow-400 px-2 py-2 md:px-4 md:py-2 border-r border-black flex items-center justify-center">
          <span className="text-black text-base md:text-lg font-extrabold">
            ≡
          </span>
        </div>
        <span
          className="px-3 py-2 md:px-4 text-xs md:text-xl text-black tracking-wide"
          style={{ fontFamily: "Luckiest Guy, sans-serif" }}
        >
          MENU
        </span>
      </button>

      {/* Logo Section */}
      <div className="text-center mt-3 md:mt-8">
        <h1
          style={{ fontFamily: "Luckiest Guy, sans-serif" }}
          className="text-xl md:text-4xl tracking-wide"
        >
          SPARKNOTES
        </h1>
        <div className="relative text-center -mt-2 md:mt-1">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-black" />
          </div>
          <span
            style={{ fontFamily: "Luckiest Guy, sans-serif" }}
            className="relative bg-background px-2 md:px-4 text-xs md:text-lg"
          >
            Skip the Fluff
          </span>
        </div>
      </div>

      {/* Right: Contact Us Button */}
      <button
        onClick={() =>
          window.open("https://www.linkedin.com/in/appaji-dheeraj/", "_blank")
        }
        className="flex items-center border bg-white border-black rounded-full overflow-hidden shadow-md"
      >
        <span
          className="text-xs px-4 py-3 text-black md:text-xl tracking-wide"
          style={{ fontFamily: "Luckiest Guy, sans-serif" }}
        >
          CONTACT US
        </span>
      </button>

      {/* Menu Dialog */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="!max-w-none !w-screen !h-screen rounded-none p-0 bg-[#FFFBD6] flex flex-col items-center justify-center gap-10">
          <DialogTitle
            style={{
              fontFamily: "Luckiest Guy, sans-serif",
              letterSpacing: "0.1em",
            }}
            className={"font-normal text-4xl md:text-6xl"}
          >
            🍴 YT Video Menu 🍴
          </DialogTitle>

          <div className="flex flex-row justify-around w-full items-center">
            <Image
              src="/blue.svg"
              alt="Menu"
              width={300}
              height={300}
              className="md:mb-1"
            />
            <div className="flex flex-col gap-4 border rounded-4xl p-6 md:p-12 bg-white shadow-lg">
              {[
                "🍿 YouTube Starter",
                "🍔 Video Burger",
                "🍝 MindMap Manchurian",
                "🍜 Xtended YT Noodles",
                "🍰 What-If Waffles",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => setMenuOpen(false)}
                  className="text-xl md:text-4xl text-black leading-16 flex items-center justify-center"
                  style={{
                    fontFamily: "Luckiest Guy, sans-serif",
                    letterSpacing: "0.1em",
                  }}
                >
                  {item}
                  {item.includes("Video Burger") && (
                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs ml-3">
                      Served Hot 🔥
                    </span>
                  )}
                </button>
              ))}

              <Separator className="my-2" />
              <p className="text-center text-black text-base md:text-lg italic">
                Prepared with ❤️ by Chef Appaji Dheeraj
              </p>
            </div>

            <Image
              src="/yellow.svg"
              alt="Menu"
              width={300}
              height={300}
              className="md:mb-1"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
