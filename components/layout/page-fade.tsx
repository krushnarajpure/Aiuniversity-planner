"use client";

export function PageFade({ children }: { children: React.ReactNode }) {
  return (
    <div className="transition-opacity duration-200 ease-out opacity-100">
      {children}
    </div>
  );
}
