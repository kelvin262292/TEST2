/**
 * Main export file for shared package
 * This file exports all components, utilities, and types
 */

// UI Components
export { Button, buttonVariants, type ButtonProps } from './components/ui/Button';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  type CardProps,
} from './components/ui/Card';
export { Spinner } from './components/ui/Spinner';

// Utilities
export { cn } from './utils/cn';

// Authentication
export {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  isAdmin,
  isAuthenticated,
  AuthenticationError,
  AuthorizationError,
  UserRole,
  type UserAuth,
  type JWTPayload,
  type AuthResult,
  type LoginInput,
  type RegisterInput,
  LoginSchema,
  RegisterSchema,
} from './lib/auth';

// Re-export types for convenience
export type { ClassValue } from 'clsx';
