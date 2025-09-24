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
        title: "What is Vibeflow?",
        href: "/docs/getting-started/what-is-vibeflow",
        description: "The Marketing Architecture Revolution"
      },
      {
        title: "Installation & Setup",
        href: "/docs/getting-started/installation",
        description: "System requirements and setup guide"
      },
      {
        title: "Quick Start",
        href: "/docs/getting-started/quick-start",
        description: "Your first brand setup in 30 minutes"
      }
    ]
  },
  {
    title: "Guides",
    items: [
      {
        title: "Brand Strategy in 30 Minutes",
        href: "/docs/guides/brand-strategy",
        description: "Complete brand setup from zero to launch"
      }
    ]
  },
  {
    title: "Core Concepts",
    items: [
      {
        title: "Marketing Architecture",
        href: "/docs/concepts/marketing-architecture",
        description: "Understanding the shift from execution to orchestration"
      },
      {
        title: "MCP & A2A Protocols",
        href: "/docs/concepts/protocols",
        description: "How agents communicate and work together"
      },
      {
        title: "The Vibeflow Framework",
        href: "/docs/concepts/framework",
        description: "Open source philosophy and core principles"
      },
      {
        title: "Vibeflow MCP",
        href: "/docs/vibeflow-mcp",
        description: "MCP tools for workflow and agent management"
      }
    ]
  }
]

// Alternative: If you want to dynamically import metadata (server-side only)
export async function getDocsNavigation() {
  try {
    // These imports only work on the server side - update paths as you create MDX files
    const overviewMeta = await import('@/app/docs/page.mdx').then(m => m.metadata)
    
    // For now, return the static navigation until MDX files are created
    // You can uncomment and update these imports as you create the corresponding MDX files:
    // const whatIsVibeflowMeta = await import('@/app/docs/what-is-vibeflow/page.mdx').then(m => m.metadata)
    // const installationMeta = await import('@/app/docs/installation/page.mdx').then(m => m.metadata)
    // const quickStartMeta = await import('@/app/docs/quick-start/page.mdx').then(m => m.metadata)
    
    return docsNavigation
  } catch (error) {
    console.warn('Could not load dynamic navigation, falling back to static:', error)
    return docsNavigation
  }
}
