
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${(value >= 0 ? '+' : '')}${(value * 100).toFixed(2)}%`;
}

export function getRandomChange(): number {
  return (Math.random() * 0.1) - 0.05; // Random between -5% and +5%
}

export function getRandomPrice(base: number): number {
  return base + (base * getRandomChange());
}
