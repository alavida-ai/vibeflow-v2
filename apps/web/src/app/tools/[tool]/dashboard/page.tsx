// src/app/tools/[tool]/dashboard/page.tsx
"use client";

import { useParams } from 'next/navigation';
import { getToolConfig } from "@/lib/tools/registry";

export default function DashboardPage() {
  const params = useParams();
  const tool = params.tool as string;
  
  const toolConfig = getToolConfig(tool);
  
  if (!toolConfig) {
    return <div>Tool not found</div>;
  }

  const { DashboardContent } = toolConfig;
  
  return <DashboardContent />;
}