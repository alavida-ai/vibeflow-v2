'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  title: string
  level: number
}

interface TableOfContentsProps {
  className?: string
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from the rendered content
    const headings = document.querySelectorAll('h2, h3, h4, h5, h6')
    
    const items: TocItem[] = Array.from(headings).map((heading) => {
      const level = parseInt(heading.tagName.charAt(1))
      const title = heading.textContent || ''
      const id = heading.id || ''
      
      return {
        id,
        title,
        level
      }
    }).filter(item => item.id && item.title) // Only include headings with IDs and titles

    setTocItems(items)
  }, [])

  useEffect(() => {
    if (tocItems.length === 0) return

    const updateActiveHeading = () => {
      // Get the scroll position accounting for the fixed header
      const scrollY = window.scrollY + 120 // 84px navbar + padding

      // Find the heading that is currently at the top of the viewport
      let currentActiveId = ''
      
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const element = document.getElementById(tocItems[i].id)
        if (element) {
          const elementTop = element.offsetTop
          
          // If this element is at or above the current scroll position, it's active
          if (elementTop <= scrollY) {
            currentActiveId = tocItems[i].id
            break
          }
        }
      }
      
      // If no heading is found (at the very top), use the first one
      if (!currentActiveId && tocItems.length > 0) {
        currentActiveId = tocItems[0].id
      }
      
      setActiveId(currentActiveId)
    }

    // Update on scroll with throttling for performance
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveHeading()
          ticking = false
        })
        ticking = true
      }
    }

    // Update immediately and on scroll
    updateActiveHeading()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [tocItems])

  // Don't render if no items
  if (tocItems.length === 0) {
    return null
  }

  return (
    <nav className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-foreground mb-4">
        On this page
      </h4>
      <ul className="space-y-1 text-sm">
        {tocItems.map((item) => {
          // Calculate indentation based on heading level
          // h2 = no indent, h3 = 1 level, h4 = 2 levels, etc.
          const indent = Math.max(0, item.level - 2)
          const isActive = activeId === item.id
          
          return (
            <li key={item.id} style={{ paddingLeft: `${indent * 16}px` }}>
              <a
                href={`#${item.id}`}
                className={cn(
                  'block py-1 transition-colors border-l-2 pl-3 -ml-3',
                  isActive 
                    ? 'text-primary border-primary font-medium' 
                    : 'text-muted-foreground border-transparent hover:text-foreground',
                  'hover:underline underline-offset-2',
                  // Different sizing for different levels
                  item.level === 2 && !isActive && 'font-medium',
                  item.level >= 3 && 'text-xs'
                )}
              >
                {item.title}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// Sticky wrapper component for the TOC
export function StickyTableOfContents({ className }: TableOfContentsProps) {
  return (
    <div className="sticky top-[84px] pt-4 h-fit max-h-[calc(100vh-104px)] overflow-y-auto">
      <TableOfContents />
    </div>
  )
}
