"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import type { StreamMessage } from "@/types/stream";

export function useSpendStream() {
  const applyMessage = useDashboardStore((s) => s.applyMessage);
  const setConnected = useDashboardStore((s) => s.setConnected);

  useEffect(() => {
    const source = new EventSource("/api/events/stream");

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    source.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as StreamMessage;
        applyMessage(msg);
      } catch {
        /* ignore malformed */
      }
    };

    return () => {
      source.close();
      setConnected(false);
    };
  }, [applyMessage, setConnected]);
}
