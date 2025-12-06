"use client";

import { ErrorBoundary } from "@/shared/components/common/ErrorBoundary";

interface MainContentWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides error boundary for main content
 * This allows the layout to be a Server Component while still having error boundaries
 */
export function MainContentWrapper({ children }: MainContentWrapperProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

