"use client";

import { useEffect, useRef } from "react";

type MyraaCoreProps = { state: "idle" | "listening" | "thinking" | "speaking" };

export function MyraaCore({ state }: MyraaCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    const draw = () => {
      const size = canvas.clientWidth * window.devicePixelRatio;
      canvas.width = size;
      canvas.height = size;
      const center = size / 2;
      const time = performance.now() / 1000;
      context.clearRect(0, 0, size, size);
      for (let index = 0; index < 36; index += 1) {
        const angle = (index / 36) * Math.PI * 2 + time * (state === "speaking" ? 0.45 : 0.12);
        const radius = size * (0.26 + ((index * 17) % 11) / 100);
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        context.fillStyle = `rgba(${state === "thinking" ? "245, 158, 11" : "34, 211, 238"}, ${0.25 + (index % 4) / 10})`;
        context.beginPath();
        context.arc(x, y, 1.5 + (index % 3), 0, Math.PI * 2);
        context.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [state]);

  return (
    <div className={`myraa-core myraa-core-${state}`} aria-label={`Myraa is ${state}`}>
      <canvas ref={canvasRef} className="myraa-core-particles" />
      <div className="myraa-core-ring myraa-core-ring-outer" />
      <div className="myraa-core-ring myraa-core-ring-inner" />
      <div className="myraa-core-light" />
    </div>
  );
}