// Custom React hooks for API data fetching with loading and error states

import { useState, useEffect, useCallback } from 'react';
import { APIError } from '@/lib/api-client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  skip?: boolean;
  retryCount?: number;
}

/**
 * Hook for fetching data from API
 * @param fetcher - Async function that fetches data
 * @param dependencies - Array of dependencies to re-fetch when they change
 * @param options - Configuration options (skip, retryCount)
 * @returns Object containing data, loading, and error states
 */
export function useApi<T>(
  fetcher: () => Promise<any>,
  dependencies: any[] = [],
  options?: UseApiOptions
): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = options?.retryCount ?? 3;

  useEffect(() => {
    if (options?.skip) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const result = await fetcher();

        if (isMounted) {
          if (result.success) {
            setState({ data: result.data, loading: false, error: null });
            setRetryCount(0);
          } else {
            setState({ data: null, loading: false, error: result.error });
            
            // Auto-retry logic
            if (retryCount < maxRetries) {
              setTimeout(() => {
                setRetryCount((prev) => prev + 1);
              }, 1000 * (retryCount + 1)); // Exponential backoff
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          setState({ data: null, loading: false, error: errorMessage });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [...dependencies, retryCount, options?.skip]);

  return state;
}

/**
 * Hook for mutation operations (POST, PUT, DELETE)
 * @returns Object with mutate function and loading/error states
 */
export function useMutation<T>(
  mutationFn: (data: any) => Promise<any>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (data: any) => {
      try {
        setState({ data: null, loading: true, error: null });
        const result = await mutationFn(data);

        if (result.success) {
          setState({ data: result.data, loading: false, error: null });
          return result.data;
        } else {
          setState({ data: null, loading: false, error: result.error });
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        throw err;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    mutate,
    reset,
    ...state,
  };
}

/**
 * Hook for paginated data fetching
 * @param fetcher - Async function that fetches paginated data
 * @param pageSize - Number of items per page
 * @returns Object with paginated data and navigation functions
 */
export function usePagination<T>(
  fetcher: (page: number) => Promise<any>,
  pageSize: number = 10
) {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetcher(page);

        if (result.success) {
          setAllData(result.data);
          setTotalPages(result.totalPages || 1);
        } else {
          setError(result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [page, fetcher]);

  return {
    data: allData,
    page,
    totalPages,
    loading,
    error,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
    goToPage: (p: number) => setPage(Math.max(1, Math.min(p, totalPages))),
  };
}

/**
 * Hook for infinite scroll pagination
 * @param fetcher - Async function that fetches data for a given page
 * @param pageSize - Number of items per page
 * @returns Object with accumulated data and loading state
 */
export function useInfiniteQuery<T>(
  fetcher: (page: number) => Promise<any>,
  pageSize: number = 10
) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher(page);

      if (result.success) {
        setData((prev) => [...prev, ...result.data]);
        setHasMore(result.data.length === pageSize);
        setPage((p) => p + 1);
      } else {
        setError(result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, fetcher, pageSize]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset: () => {
      setData([]);
      setPage(1);
      setHasMore(true);
    },
  };
}
