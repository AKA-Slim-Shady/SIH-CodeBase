// backend/src/middlewares/authMiddleware.js

import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// This is a simple wrapper around the Clerk middleware
// We create this file to make it easy to add more custom middleware later if needed
export const protect = ClerkExpressRequireAuth();