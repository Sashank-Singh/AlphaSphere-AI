
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatPercentage(value: number | undefined): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function getRandomPrice(basePrice: number = 100): number {
  return basePrice + (Math.random() - 0.5) * 20;
}

export function getRandomChange(): number {
  return (Math.random() - 0.5) * 10;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;
  let resolvePromise: (value: ReturnType<T>) => void;
  let rejectPromise: (reason?: any) => void;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise<ReturnType<T>>((resolve, reject) => {
      // Clear the previous timeout
      clearTimeout(timeoutId);

      // If there's already a pending promise, resolve it with the current promise
      if (pendingPromise) {
        resolvePromise = resolve;
        rejectPromise = reject;
      } else {
        resolvePromise = resolve;
        rejectPromise = reject;
        
        pendingPromise = new Promise<ReturnType<T>>((res, rej) => {
          resolvePromise = res;
          rejectPromise = rej;
        });
      }

      // Set a new timeout
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolvePromise(result);
          pendingPromise = null;
        } catch (error) {
          rejectPromise(error);
          pendingPromise = null;
        }
      }, delay);
    });
  };
}
