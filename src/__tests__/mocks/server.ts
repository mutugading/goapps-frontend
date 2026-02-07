// MSW Server Setup for Node.js (test environment)
import { setupServer } from "msw/node"
import { handlers } from "./handlers"

// Create server with handlers
export const server = setupServer(...handlers)
