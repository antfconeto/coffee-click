"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web";

export function CookieLogo({ size = 150, path = "/json-animations/coffee-logo.json"}: { size?: number, path?: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: path,
    });

    return () => anim.destroy();
  }, []);

  return <div ref={container} style={{ width: size, height: size }} />;
}
