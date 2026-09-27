import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown, fallback: string = "Terjadi kesalahan yang tidak diketahui"): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "detail" in error &&
    typeof (error as Record<string, unknown>).detail === "string"
  ) {
    return (error as Record<string, unknown>).detail as string;
  }
  return fallback;
}

