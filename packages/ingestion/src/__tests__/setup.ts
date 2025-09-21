import { beforeEach, afterEach, vi } from 'vitest'
import { resetTwitterClient } from '../pipelines/factories'

// Reset singletons and global state before each test
beforeEach(() => {
  // Reset all mocks to clear call history and configured return values
  vi.clearAllMocks()
  vi.resetAllMocks()
  
  // Reset singletons
  resetTwitterClient()
  
  // Reset environment variables
  vi.unstubAllEnvs()
})

afterEach(() => {
  // Clean up any test artifacts
  vi.restoreAllMocks()
})
