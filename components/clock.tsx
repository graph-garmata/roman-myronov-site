"use client";

import { useEffect, useState } from "react";

function format(date: Date) {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function Clock() {
  // Render a stable placeholder on the server to avoid hydration mismatch;
  // the real, ticking time is filled in after mount.
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <time suppressHydrationWarning aria-label="Local time">
      {time ?? "--:--:--"}
    </time>
  );
}
