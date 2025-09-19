'use client'

import { useEffect, useState } from 'react'

export function HydrationProvider({ children }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Clean up browser extension attributes that can cause hydration mismatches
    const cleanupExtensionAttributes = () => {
      // Remove Dashlane attributes
      const elementsWithDashlane = document.querySelectorAll('[data-dashlane-rid]')
      elementsWithDashlane.forEach(el => {
        el.removeAttribute('data-dashlane-rid')
      })

      // Remove other common extension attributes
      const elementsWithAutoFill = document.querySelectorAll('[data-auto-fill]')
      elementsWithAutoFill.forEach(el => {
        el.removeAttribute('data-auto-fill')
      })

      // Remove LastPass attributes
      const elementsWithLastPass = document.querySelectorAll('[data-lpignore]')
      elementsWithLastPass.forEach(el => {
        el.removeAttribute('data-lpignore')
      })
    }

    // Initial cleanup
    cleanupExtensionAttributes()

    // Set up a mutation observer to clean up dynamically added attributes
    const observer = new MutationObserver((mutations) => {
      let needsCleanup = false
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName?.includes('dashlane') || 
             mutation.attributeName?.includes('auto-fill') ||
             mutation.attributeName?.includes('lpignore'))) {
          needsCleanup = true
        }
      })
      
      if (needsCleanup) {
        cleanupExtensionAttributes()
      }
    })

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-dashlane-rid', 'data-auto-fill', 'data-lpignore']
    })

    setIsHydrated(true)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Show nothing on server, children on client after hydration
  if (!isHydrated) {
    return <div suppressHydrationWarning>{children}</div>
  }

  return children
}
