
import React from "react"
import { Sidebar } from "@/components/sidebar"
import { StickyTableOfContents } from "@/components/table-of-contents"
import { DocsBreadcrumb } from "@/components/docs-breadcrumb"
import { docsNavigation } from "@/config/docs-nav"
import { useIsMobile } from "@/hooks/use-mobile"

interface DocsLayoutProps {
  children: React.ReactNode
}

export default async function DocsLayout({ children }: DocsLayoutProps) {
  const sidebarItems = docsNavigation
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Sidebar - Navigation */}
      <Sidebar items={sidebarItems} className="hidden md:block pt-4" />
      
      {/* Main Content Area */}
      <section className="flex-1">
        <div className="flex max-w-7xl mx-auto min-h-screen">
          {/* Content */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="p-4">
            <div className="not-prose">
              <DocsBreadcrumb />
            </div>
            <div className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none">
              {children}
            </div>
            </div>
          </div>
          
          {/* Right Sidebar - Table of Contents */}
          <div className="hidden lg:block w-64 shrink-0 px-6">
            <StickyTableOfContents />
          </div>
        </div>
      </section>
    </div>
  )
}
