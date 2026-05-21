import { ImageResponse } from "next/og";
import { getCourseByCode } from "@/lib/courses";
import { slugToCode } from "@/lib/slug";
import { SITE_NAME } from "@/lib/site";

export const alt = "Course on WesternScope";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

// Per-course Open Graph image so shared course links render a rich, branded
// card with the course code and title.
export default async function Image({ params }: Props) {
  const { slug } = await params;
  const code = slugToCode(slug);
  const course = code ? await getCourseByCode(code) : null;

  const heading = course?.code ?? SITE_NAME;
  const title = course?.title ?? "Course reviews for Western University";
  // Keep long titles from overflowing the card.
  const safeTitle = title.length > 90 ? `${title.slice(0, 89)}…` : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#4F2683",
          backgroundImage: "linear-gradient(135deg, #4F2683 0%, #2E1650 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: "#C4B5DE" }}>
            {heading}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {safeTitle}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 32,
            color: "#E5D9F2",
          }}
        >
          {SITE_NAME} · Course reviews by Mustangs
        </div>
      </div>
    ),
    { ...size },
  );
}
