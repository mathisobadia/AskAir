import { ImageResponse } from "next/og";
export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontSize: 60,
          letterSpacing: -2,
          justifyContent: "center",
          width: "1200px",
          height: "630px",
          gap: "40px",
          fontWeight: 700,
          backgroundImage: "linear-gradient(to bottom, #dbf4ff, #fff1f1)",
        }}
      >
        <img
          src="https://askair.ai/askair-logo.png"
          alt="AskAir Logo"
          style={{ width: "200px" }}
        />
        <span
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgb(0, 124, 240), rgb(0, 223, 216))",
            backgroundClip: "text",
            color: "transparent",
            fontSize: "50px",
          }}
        >
          AskAir
        </span>
        <span style={{ fontSize: "50px" }}>
          <div>Automate Your Airtable Data Entry</div>
        </span>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
