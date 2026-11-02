import { ImageResponse } from "next/og";
import { MarkImage } from "@/components/brand/MarkImage";
import { tokens } from "@/lib/tokens";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: tokens.ink,
        }}
      >
        <MarkImage width={140} color={tokens.bone} />
      </div>
    ),
    size,
  );
}
