"use client";

import { Separator } from "../../components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from "react-icons/fa";

export default function FooterSection() {
  return (
    <footer className="mx-8 bg-[#FFFBD6] border-t-2 border-l-2 border-r-2 border-black rounded-t-4xl pl-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-6">
      {/* Text block */}
      <div className="flex flex-col mt-0 max-w-lg">
        <h2
          style={{ fontFamily: "Luckiest Guy, sans-serif" }}
          className="text-2xl md:text-5xl"
        >
          TOO LAZY TO WATCH?
        </h2>
        <p
          style={{ fontFamily: "Luckiest Guy, sans-serif" }}
          className="italic text-xl"
        >
          WE GET IT...
        </p>
        <Separator className="my-3" />

        {/* About SparkNotes */}
        <p className="text-sm text-black leading-relaxed mb-2">
          SparkNotes is your ultimate shortcut to YouTube wisdom! We help you
          skip the fluff and get straight to the good stuff—brought to you by
          SparkNotes Ltd.
        </p>

        {/* Social Links */}
        <div className="flex gap-4 mb-2">
          <Link
            href="https://github.com/AppajiDheeraj"
            target="_blank"
            aria-label="GitHub"
          >
            <FaGithub size={22} className="hover:text-black/70 transition" />
          </Link>
          <Link
            href="https://linkedin.com/in/appaji-dheeraj/"
            target="_blank"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={22} className="hover:text-black/70 transition" />
          </Link>
          <Link
            href="https://twitter.com/appaji_dhe22452"
            target="_blank"
            aria-label="Twitter"
          >
            <FaTwitter size={22} className="hover:text-black/70 transition" />
          </Link>
          <Link
            href="https://instagram.com/appaji_dheeraj"
            target="_blank"
            aria-label="Instagram"
          >
            <FaInstagram size={22} className="hover:text-black/70 transition" />
          </Link>
        </div>

        <Separator className="my-3" />

        {/* Made by line */}
        <p className="font-bold text-sm sm:text-base">
          Made with ❤️ by Appaji Dheeraj
        </p>
      </div>

      {/* Relaxed SVG */}
      <div className="-mt-2">
        <Image
          src="/1.svg"
          alt="Relaxed Brain"
          width={620}
          height={820}
          className="h-auto"
          priority
        />
      </div>
    </footer>
  );
}
