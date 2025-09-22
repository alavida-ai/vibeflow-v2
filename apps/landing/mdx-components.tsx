import type { MDXComponents } from 'mdx/types'
import React from 'react'
import { cn } from '@/lib/utils'

// Utility function to generate URL-friendly slugs from heading text
function generateId(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Helper component for headings with anchor links
function HeadingWithAnchor({ 
  level, 
  children, 
  className = '' 
}: { 
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  className?: string 
}) {
  const text = children?.toString() || ''
  const id = generateId(text)

  const headingProps = {
    id,
    className: cn(className, 'scroll-mt-[100px] group'),
    children: (
      <a 
        href={`#${id}`}
        className="no-underline hover:underline flex items-center gap-2"
      >
        {children}
        <span className="opacity-0 group-hover:opacity-50 text-muted-foreground ml-2 text-sm">
          #
        </span>
      </a>
    )
  }

  switch (level) {
    case 1: return <h1 {...headingProps} />
    case 2: return <h2 {...headingProps} />
    case 3: return <h3 {...headingProps} />
    case 4: return <h4 {...headingProps} />
    case 5: return <h5 {...headingProps} />
    case 6: return <h6 {...headingProps} />
    default: return <h1 {...headingProps} />
  }
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: ({ children }) => (
      <HeadingWithAnchor 
        level={1}
        className="text-4xl font-bold mb-6 text-foreground"
      >
        {children}
      </HeadingWithAnchor>
    ),
    h2: ({ children }) => (
      <HeadingWithAnchor 
        level={2}
        className="text-3xl font-semibold mb-4 mt-8 text-foreground"
      >
        {children}
      </HeadingWithAnchor>
    ),
    h3: ({ children }) => (
      <HeadingWithAnchor 
        level={3}
        className="text-2xl font-semibold mb-3 mt-6 text-foreground"
      >
        {children}
      </HeadingWithAnchor>
    ),
    h4: ({ children }) => (
      <HeadingWithAnchor 
        level={4}
        className="text-xl font-semibold mb-2 mt-4 text-foreground"
      >
        {children}
      </HeadingWithAnchor>
    ),
    p: ({ children }) => (
      <p className="mb-4 text-foreground leading-relaxed">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2 text-muted-foreground">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    code: ({ children }) => (
      <code className="bg-muted px-2 py-1 rounded-md text-sm font-mono text-foreground">{children}</code>
    ),
    pre: ({ children }) => (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4 text-sm">{children}</pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">{children}</blockquote>
    ),
    a: ({ children, href }) => (
      <a href={href} className="text-primary hover:underline">{children}</a>
    ),
    ...components,
  }
}
