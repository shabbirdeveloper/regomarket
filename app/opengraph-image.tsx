import { ImageResponse } from "next/og";

export const alt = "REGO.pk — Buy & Sell in Gilgit-Baltistan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default Open Graph card. Listing and shop routes will generate their own. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #022C22 0%, #064E3B 60%, #0B5A45 100%)",
          color: "white",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 700 }}>
          <span>REGO</span>
          <span style={{ color: "#E6C77A", marginLeft: -12 }}>.pk</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 600 }}>Buy &amp; Sell in</div>
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 600, color: "#E6C77A" }}>Gilgit-Baltistan</div>
          <div style={{ marginTop: 24, fontSize: 30, color: "rgba(255,255,255,0.75)", fontFamily: "sans-serif" }}>
            From Farms, Homes &amp; Local Markets — Direct to Buyers
          </div>
        </div>
        <svg width="1056" height="90" viewBox="0 0 1056 90">
          <path
            d="M0 88 110 40l60 24 104-64 70 36 84-46 118 72 64-26 110 46 80-54 96 42 76-26 90 44"
            fill="none"
            stroke="#C99A3D"
            strokeOpacity="0.6"
            strokeWidth="3"
          />
        </svg>
      </div>
    ),
    size,
  );
}
