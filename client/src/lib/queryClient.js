import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,

      retry: (failureCount, error) => {
        const status = error?.response?.status;

        if (status === 401 || status === 403 || status === 404) {
          return false;
        }

        return failureCount < 1;
      },

      refetchOnWindowFocus: false,
    },

    mutations: {
      onError: (error) => {
        const message =
          error?.response?.data?.message || 'Something went wrong';

        toast.error(message);
      },
    },
  },
});

export default queryClient;
