"use client";

import { useEffect, useRef } from "react";
import lottie from "lottie-web";

export default function LoaderCookie() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/json-animations/coffee-computer.json",
    });

    return () => anim.destroy();
  }, []);

  return <div ref={container} style={{ width: 150, height: 150 }} />;
}
