"use client";

import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";

// OPTIONAL for JS projects
interface AuthSession {
  serverSession: Session | null;
}
export default function AuthButton({
  serverSession,
  className,
}: AuthSession & { className?: string }) {
  // Takes in the session from page.tsx, and returns either a
  // sign in or sign out button depending on their authentication
  // status.

  return serverSession ? (
    <Button
      onClick={() =>
        signOut({
          redirectTo: "/",
        })
      }
      variant={"outline"}
      className={className}
    >
      Sign Out
    </Button>
  ) : (
    <Button onClick={() => signIn()} className={className}>
      Sign In
    </Button>
  );
}
