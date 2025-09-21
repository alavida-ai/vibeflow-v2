# Ingestion Pipeline Testing Guide

This directory contains comprehensive tests for the `@vibeflow/ingestion` package, covering all components from unit tests to full integration tests.

## Test Structure

```
__tests__/
├── setup.ts                     # Global test setup
├── test-utils/                  # Shared testing utilities
│   ├── index.ts                 # Export all utilities
│   ├── mock-factories.ts        # Mock data factories
│   ├── mock-twitter-client.ts   # TwitterClient mocks
│   └── mock-database.ts         # Database service mocks
├── sources/                     # API client tests
│   ├── TwitterClient.test.ts    # TwitterClient unit tests
│   └── endpoints.test.ts        # Endpoint classes tests
├── transformers/                # Data transformation tests
│   └── TweetTransformer.test.ts # Tweet transformation logic
├── sinks/                       # Data persistence tests
│   └── TweetSink.test.ts        # Database sink tests
├── pipelines/                   # Pipeline orchestration tests
│   ├── TwitterPipeline.test.ts  # End-to-end pipeline tests
│   └── factories.test.ts        # Pipeline factory tests
├── example.integration.test.ts  # Complete integration examples
└── README.md                    # This file
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test TwitterClient.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should handle API errors"
```

### Test Categories

1. **Unit Tests**: Test individual components in isolation
   - `TwitterClient.test.ts` - API client functionality
   - `TweetTransformer.test.ts` - Data transformation logic
   - `TweetSink.test.ts` - Database persistence
   - `endpoints.test.ts` - API endpoint wrappers

2. **Integration Tests**: Test component interactions
   - `TwitterPipeline.test.ts` - Full pipeline orchestration
   - `factories.test.ts` - Pipeline factory methods
   - `example.integration.test.ts` - Complete workflow examples

## Test Utilities

### Mock Factories

Create realistic test data with `mock-factories.ts`:

```typescript
import { createMockApiTweet, createMockTweetsApiResponse } from '../test-utils'

const mockTweet = createMockApiTweet({
  id: '123',
  text: 'Custom tweet text',
  author: { userName: 'testuser' }
})
```

### Mocking External Dependencies

Mock the TwitterClient and database services:

```typescript
import { mockTwitterClient, mockTwitterService } from '../test-utils'

const mockClient = mockTwitterClient()
const mockService = mockTwitterService()

// Configure mock responses
mockClient.getUserMentions.mockResolvedValue(mockResponse)
mockService.insertTweetsWithMedia.mockResolvedValue(savedTweets)
```

## Writing New Tests

### 1. Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { YourComponent } from '../../path/to/component'
import { mockDependencies } from '../test-utils'

describe('YourComponent', () => {
  let component: YourComponent
  let mockDeps: ReturnType<typeof mockDependencies>

  beforeEach(() => {
    mockDeps = mockDependencies()
    component = new YourComponent(mockDeps)
  })

  describe('methodName', () => {
    it('should handle normal case', async () => {
      // Arrange
      const input = { /* test data */ }
      mockDeps.someMethod.mockResolvedValue(expectedOutput)

      // Act
      const result = await component.methodName(input)

      // Assert
      expect(result).toEqual(expectedOutput)
      expect(mockDeps.someMethod).toHaveBeenCalledWith(input)
    })

    it('should handle error case', async () => {
      // Arrange
      mockDeps.someMethod.mockRejectedValue(new Error('Test error'))

      // Act & Assert
      await expect(component.methodName({})).rejects.toThrow('Test error')
    })
  })
})
```

### 2. Integration Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createPipelineFactory } from '../../pipelines/factories'
import { mockTwitterClient, mockTwitterService } from '../test-utils'

describe('Pipeline Integration', () => {
  let mockClient: ReturnType<typeof mockTwitterClient>
  let mockService: ReturnType<typeof mockTwitterService>

  beforeEach(() => {
    mockClient = mockTwitterClient()
    mockService = mockTwitterService()
  })

  it('should process complete workflow', async () => {
    // Setup mocks
    mockClient.someEndpoint.mockResolvedValue(apiResponse)
    mockService.insertData.mockResolvedValue(savedData)

    // Run pipeline
    const pipeline = createPipelineFactory()
    const result = await pipeline.run(params)

    // Verify end-to-end behavior
    expect(result.success).toBe(true)
    expect(mockClient.someEndpoint).toHaveBeenCalledWith(expectedParams)
    expect(mockService.insertData).toHaveBeenCalledWith(expectedData)
  })
})
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Follow the Arrange-Act-Assert pattern

### 2. Mock Management
- Reset mocks in `beforeEach` hooks
- Use the provided mock utilities for consistency
- Mock only what you need to test

### 3. Assertions
- Test both success and error cases
- Verify external calls were made correctly
- Assert on meaningful business logic, not implementation details

### 4. Test Data
- Use the mock factories for consistent test data
- Override only the fields relevant to your test
- Keep test data minimal but realistic

## Debugging Tests

### Common Issues

1. **Singleton State**: If tests interfere with each other, ensure singletons are reset in `setup.ts`

2. **Mock Timing**: For async operations, ensure mocks are configured before the code under test runs

3. **Environment Variables**: Use `vi.stubEnv()` to set environment variables in tests

### Debug Techniques

```typescript
// Add debug logging
console.log('Mock calls:', mockClient.getUserMentions.mock.calls)

// Inspect mock return values
expect(mockService.insertTweetsWithMedia).toHaveBeenCalledWith(
  expect.arrayContaining([
    expect.objectContaining({ apiId: '123' })
  ])
)

// Use snapshots for complex objects
expect(result).toMatchSnapshot()
```

## Coverage Goals

- **Unit Tests**: 90%+ coverage for individual components
- **Integration Tests**: Cover all major workflow paths
- **Error Handling**: Test all error scenarios
- **Edge Cases**: Empty data, null values, network timeouts

## Contributing

When adding new features:
1. Add unit tests for new components
2. Update integration tests for workflow changes
3. Add new mock factories for new data types
4. Update this README if adding new test patterns
