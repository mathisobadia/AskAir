"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import type { Menu } from "./layout";

export function MenuItem({
  target,
  children,
}: {
  target: string;
  children: React.ReactNode;
}) {
  let css = "";
  if (usePathname() == target) {
    css = " bg-secondary ";
  }

  return (
    <Link
      href={target}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${css}`}
    >
      {children}
    </Link>
  );
}
