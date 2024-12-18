import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";

export const AirtableConnectButton = async ({
  workspaceId,
  callToAction = "Connect Airtable",
}: {
  workspaceId: string;
  callToAction?: string;
}) => {
  let scopes = [
    "data.records:read",
    "data.recordComments:read",
    "data.records:write",
    "data.recordComments:write",
    "schema.bases:read",
    "schema.bases:write",
    "webhook:manage",
    "user.email:read",
  ];
  let code_verifier = process.env.AIRTABLE_CODE_VERIFIER;
  // Generate base64 url-encoding of the sha256 of the code_verifier
  async function generateBase64UrlEncodedSha256(codeVerifier: string) {
    // Convert the string into an ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);

    // Compute the SHA-256 hash of the ArrayBuffer
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Convert the ArrayBuffer to an Array of bytes
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // Convert bytes to base64
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));

    // Replace '+' with '-', '/' with '_', and remove '='
    return hashBase64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  let code_challenge = await generateBase64UrlEncodedSha256(code_verifier);

  let url = new URL("https://airtable.com/oauth2/v1/authorize");
  url.searchParams.append("client_id", process.env.AIRTABLE_CLIENT_ID);
  url.searchParams.append("redirect_uri", process.env.AIRTABLE_REDIRECT_URI);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("scope", scopes.join(" "));
  url.searchParams.append("state", workspaceId);
  url.searchParams.append("code_challenge", code_challenge);
  url.searchParams.append("code_challenge_method", "S256");

  return (
    <Link
      className={buttonVariants({ className: "mt-10 w-full" })}
      href={url.toString()}
    >
      {callToAction}
    </Link>
  );
};
