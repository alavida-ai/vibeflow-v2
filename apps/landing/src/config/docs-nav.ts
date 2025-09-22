// Simple docs navigation - just define your structure here
// Next.js will handle the routing automatically based on file structure

export interface NavItem {
  title: string
  href: string
  description?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const docsNavigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Overview",
        href: "/docs",
        description: "Get up and running with our platform"
      },
      {
        title: "Configuration", 
        href: "/docs/configuration",
        description: "Learn how to configure your application"
      }
    ]
  },
  {
    title: "API",
    items: [
      {
        title: "API Reference",
        href: "/docs/api-reference", 
        description: "Complete API documentation"
      }
    ]
  }
]

// Alternative: If you want to dynamically import metadata (server-side only)
export async function getDocsNavigation() {
  try {
    // These imports only work on the server side
    const overviewMeta = await import('@/app/docs/page.mdx').then(m => m.metadata)
    const configMeta = await import('@/app/docs/configuration/page.mdx').then(m => m.metadata)
    const apiMeta = await import('@/app/docs/api-reference/page.mdx').then(m => m.metadata)
    
    return [
      {
        title: "Getting Started",
        items: [
          {
            title: overviewMeta.title,
            href: "/docs",
            description: overviewMeta.description
          },
          {
            title: configMeta.title,
            href: "/docs/configuration", 
            description: configMeta.description
          }
        ]
      },
      {
        title: "API",
        items: [
          {
            title: apiMeta.title,
            href: "/docs/api-reference",
            description: apiMeta.description
          }
        ]
      }
    ]
  } catch (error) {
    console.warn('Could not load dynamic navigation, falling back to static:', error)
    return docsNavigation
  }
}
