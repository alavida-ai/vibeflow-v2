'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { docsNavigation } from '@/config/docs-nav'

export function DocsBreadcrumb() {
  const pathname = usePathname()

  // Helper function to find page info from navigation
  const findPageInfo = (path: string) => {
    for (const section of docsNavigation) {
      for (const item of section.items) {
        if (item.href === path) {
          return {
            section: section.title,
            page: item.title,
            isRoot: path === '/docs'
          }
        }
      }
    }
    return null
  }

  const pageInfo = findPageInfo(pathname)

  // Don't show breadcrumbs if we can't find the page
  if (!pageInfo) {
    return null
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {pageInfo.isRoot ? (
          <BreadcrumbItem>
            <BreadcrumbPage>Documentation</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/docs">Documentation</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator />
            
            <BreadcrumbItem>
              <BreadcrumbPage>{pageInfo.page}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
