import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement, ReactNode } from 'react';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

export function renderWithClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const testQueryClient = createTestQueryClient();
  const { rerender, ...result } = render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>,
    options
  );
  return {
    ...result,
    rerender: (rerenderUi: ReactElement) =>
      rerender(
        <QueryClientProvider client={testQueryClient}>{rerenderUi}</QueryClientProvider>
      ),
    queryClient: testQueryClient,
  };
}

export function createWrapper() {
  const testQueryClient = createTestQueryClient();
  return {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
    ),
    queryClient: testQueryClient,
  };
}
