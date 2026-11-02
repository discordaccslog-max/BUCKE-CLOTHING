import { ImageResponse } from "next/og";
import { MarkImage } from "@/components/brand/MarkImage";
import { site } from "@/lib/site";
import { tokens } from "@/lib/tokens";

export const alt = `${site.legalName}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(ellipse at 50% 40%, ${tokens.grey800}, ${tokens.ink} 70%)`,
          color: tokens.bone,
        }}
      >
        <MarkImage size={190} color={tokens.bone} />
        <div style={{ display: "flex", marginTop: 44, fontSize: 92, fontWeight: 700, letterSpacing: 26 }}>
          BUCKE
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 22, fontSize: 24, letterSpacing: 6, color: tokens.grey400 }}>
          <div style={{ width: 48, height: 2, background: tokens.accentLight, marginRight: 20 }} />
          {site.tagline.toUpperCase()}
          <div style={{ width: 48, height: 2, background: tokens.accentLight, marginLeft: 20 }} />
        </div>
      </div>
    ),
    size,
  );
}
