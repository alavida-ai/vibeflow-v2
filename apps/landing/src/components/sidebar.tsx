"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

interface SidebarItem {
  title: string
  href?: string
  items?: SidebarItem[]
}

interface SidebarProps {
  items: SidebarItem[]
  className?: string
}

interface SidebarSectionProps {
  item: SidebarItem
  level?: number
}

function SidebarSection({ item, level = 0 }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const hasChildren = item.items && item.items.length > 0

  return (
    <div className="w-full">
      {hasChildren ? (
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            level === 0 ? "text-foreground" : "text-foreground/80",
          )}
        >
          <span className="text-left">{item.title}</span>
          {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        </Button>
      ) : (
        <a
          href={item.href || "#"}
          className={cn(
            "block rounded-lg px-3 py-2 text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            level === 0
              ? "font-medium text-foreground"
              : "text-foreground/70 hover:text-foreground",
            level > 0 && "ml-4",
          )}
        >
          {item.title}
        </a>
      )}

      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.items?.map((subItem, index) => (
            <SidebarSection key={index} item={subItem} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ items, className }: SidebarProps) {
  return (
    <nav
      className="sticky top-[84px] w-64 bg-card border-r border-border h-[calc(100vh-84px)] max-h-[calc(100vh-84px)] flex flex-col p-4 overflow-y-auto"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <SidebarSection key={index} item={item} />
        ))}
      </div>
    </nav>
  )
}
