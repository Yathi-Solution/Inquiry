"use client";

import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import ErrorBoundary from '@/components/ErrorBoundary';
import Dashboard from '@/components/Dashboard';

const queryClient = new QueryClient();

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}