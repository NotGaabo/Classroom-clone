"use client";

import { useState } from "react";

export default function NotFound() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8">
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Content */}
        <div className="flex-1 max-w-md">
          {/* 404 error label */}
          <p className="text-violet-600 font-medium text-sm mb-3 tracking-wide">
            404 error
          </p>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Under maintenance
          </h1>

          {/* Description */}
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Sorry, the page you are looking for doesn't exist or has been moved.
            Try searching our site:
          </p>

          {/* Search Bar */}
          
        </div>

        {/* Right: 404 Illustration */}
        <div className="flex-1 flex items-center justify-center">
          <svg
            viewBox="0 0 380 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full max-w-md"
          >
            {/* Horizontal lines */}
            <line x1="10" y1="30" x2="370" y2="30" stroke="#d1d5db" strokeWidth="1" />
            <line x1="10" y1="130" x2="370" y2="130" stroke="#d1d5db" strokeWidth="1" />

            {/* === First "4" === */}
            {/* Diagonal left side of 4 */}
            <line x1="30" y1="30" x2="30" y2="100" stroke="#9ca3af" strokeWidth="1.5" />
            {/* Circle top-left */}
            <circle cx="30" cy="30" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
            {/* Circle bottom junction */}
            <circle cx="30" cy="100" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />

            {/* Horizontal bar of 4 */}
            <line x1="30" y1="100" x2="90" y2="100" stroke="#9ca3af" strokeWidth="1.5" />
            {/* Circle right of horizontal */}
            <circle cx="90" cy="100" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />

            {/* Vertical right side of 4 */}
            <line x1="80" y1="30" x2="80" y2="130" stroke="#9ca3af" strokeWidth="1.5" />
            {/* Circle top-right */}
            <circle cx="80" cy="30" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
            {/* Circle bottom-right */}
            <circle cx="80" cy="130" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />

            {/* Diagonal connecting top-left to horizontal */}
            <line x1="30" y1="30" x2="80" y2="100" stroke="#9ca3af" strokeWidth="1.5" />

            {/* === "0" in the middle === */}
            {/* Outer circle */}
            <ellipse cx="190" cy="80" rx="55" ry="52" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
            {/* Inner circle */}
            <ellipse cx="190" cy="80" rx="28" ry="28" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
            {/* Corner circles on 0 */}
            <circle cx="190" cy="28" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
            <circle cx="190" cy="132" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
            <circle cx="135" cy="80" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
            <circle cx="245" cy="80" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />

            {/* === Second "4" (mirrored) === */}
            {/* Vertical left side */}
            <line x1="280" y1="30" x2="280" y2="130" stroke="#9ca3af" strokeWidth="1.5" />
            {/* Circle top */}
            <circle cx="280" cy="30" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
            {/* Circle bottom */}
            <circle cx="280" cy="130" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />

            {/* Horizontal bar */}
            <line x1="280" y1="100" x2="340" y2="100" stroke="#9ca3af" strokeWidth="1.5" />
            {/* Circle left of horizontal */}
            <circle cx="280" cy="100" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />

            {/* Diagonal right side connecting to bar */}
            <line x1="330" y1="30" x2="280" y2="100" stroke="#9ca3af" strokeWidth="1.5" />
            {/* Vertical right side */}
            <line x1="330" y1="30" x2="330" y2="100" stroke="#9ca3af" strokeWidth="1.5" />
            {/* Circle top-right */}
            <circle cx="330" cy="30" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
            {/* Circle bottom-right of horizontal */}
            <circle cx="340" cy="100" r="8" stroke="#9ca3af" strokeWidth="1.5" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}