import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Same mechanism as opengraph-image.tsx, same reasoning on skipping a
// real font file. There was no favicon at all before this — browsers
// were showing a blank/default tab icon.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0d10",
          borderRadius: 7,
        }}
      >
        <div style={{ display: "flex", color: "#e8a33d", fontSize: 20, fontWeight: 700 }}>
          W
        </div>
      </div>
    ),
    { ...size }
  );
}
