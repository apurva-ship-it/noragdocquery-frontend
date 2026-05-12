import React from "react";

interface ResponsiveLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function ResponsiveLayout({ left, right }: ResponsiveLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 h-full min-h-0">
      <div className="w-full md:w-2/5 flex flex-col min-h-0">{left}</div>
      <div className="w-full md:w-3/5 flex flex-col min-h-0">{right}</div>
    </div>
  );
}
