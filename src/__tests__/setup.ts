// Test setup file - runs before each test
import "@testing-library/jest-dom"
import { afterAll, afterEach, beforeAll } from "vitest"
import { cleanup } from "@testing-library/react"
import { server } from "./mocks/server"

// Set API URL for tests - MSW will intercept requests to this URL
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000"

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" })  // Changed to warn for debugging
})

// Reset handlers after each test for isolation
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Clean up after all tests
afterAll(() => {
  server.close()
})

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
