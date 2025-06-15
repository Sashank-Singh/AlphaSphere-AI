
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseAsyncOperationOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const useAsyncOperation = <T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred'
  } = options;

  const execute = useCallback(async (...args: any[]) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await operation(...args);
      setData(result);
      
      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage,
        });
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (showErrorToast) {
        toast({
          title: 'Error',
          description: error.message || errorMessage,
          variant: 'destructive',
        });
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [operation, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, reset };
};
