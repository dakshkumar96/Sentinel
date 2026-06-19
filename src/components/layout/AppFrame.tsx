"use client";

import type { ReactNode } from "react";
import { useSpendStream } from "@/hooks/use-spend-stream";
import { ApprovalGate } from "@/components/alerts/ApprovalGate";
import { TopBar } from "./TopBar";

export function AppFrame({ children }: { children: ReactNode }) {
  useSpendStream();

  return (
    <div className="min-h-screen content-bg">
      <ApprovalGate />
      <TopBar />
      <main className="mx-auto w-full max-w-7xl px-6 py-7">{children}</main>
    </div>
  );
}
