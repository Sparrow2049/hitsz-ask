import { ImageResponse } from "next/og";

export const alt = "Waypoint — survive the semester";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build time via Satori (bundled in Next.js — next/og), not a
// static asset. Deliberately uses the default system font rather than
// loading Fraunces/Inter: pulling a real font file in means either
// fetching from a network location outside this sandbox's allowed domains
// (fonts.gstatic.com isn't on the allowlist) or bundling a font binary
// into the repo, and the default sans renders perfectly legibly at this
// size — not worth the extra risk for a launch-polish item. Colors are
// the real --color-* values from globals.css (dark mode), so this
// actually matches the site rather than approximating it.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0b0d10",
          backgroundImage:
            "radial-gradient(circle at 22% 18%, rgba(232,163,61,0.16), transparent 45%)",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid #262b31",
            color: "#8b9198",
            fontSize: 24,
            letterSpacing: 3,
          }}
        >
          HITSZ CS
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              fontWeight: 700,
              color: "#ece9e2",
              lineHeight: 1.05,
            }}
          >
            Waypoint
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 38,
              color: "#8b9198",
              maxWidth: 900,
            }}
          >
            Ask a senior who&apos;s already taken the course. Find the notes
            and past papers that actually help.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28 }}>
          <div style={{ display: "flex", color: "#e8a33d" }}>●</div>
          <div style={{ display: "flex", color: "#ece9e2" }}>hitszask.site</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
