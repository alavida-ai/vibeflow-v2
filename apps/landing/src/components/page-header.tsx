import React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn('border-b pb-8 pt-6 mb-8', className)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

