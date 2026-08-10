import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = "WesternScope - Course reviews for Western University";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default Open Graph image used for every route without a more specific one
// (home, /courses, /about). Western purple (#4F2683) branding.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#4F2683",
          backgroundImage: "linear-gradient(135deg, #4F2683 0%, #2E1650 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: "-0.03em" }}>
          {SITE_NAME}
        </div>
        <div style={{ marginTop: 24, fontSize: 44, color: "#E5D9F2" }}>
          Course reviews for Western University
        </div>
        <div style={{ marginTop: 48, fontSize: 30, color: "#C4B5DE" }}>
          By Mustangs, for Mustangs.
        </div>
      </div>
    ),
    { ...size },
  );
}
