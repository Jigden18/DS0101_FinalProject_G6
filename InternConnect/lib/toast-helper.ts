import { toast } from "sonner"

/**
 * Safe wrapper for toast errors that ensures the error is always a string
 * Handles Error objects, strings, and unknown types
 */
export function safeToastError(error: unknown): void {
  if (typeof error === "string") {
    toast.error(error)
  } else if (error instanceof Error) {
    toast.error(error.message)
  } else if (error && typeof error === "object" && "message" in error) {
    const msg = (error as Record<string, unknown>).message
    toast.error(typeof msg === "string" ? msg : "An error occurred")
  } else {
    toast.error("An error occurred")
  }
}

/**
 * Safe wrapper for toast success
 */
export function safeToastSuccess(message: string): void {
  toast.success(message)
}

/**
 * Safe wrapper for toast warning
 */
export function safeToastWarning(error: unknown): void {
  if (typeof error === "string") {
    toast.warning(error)
  } else if (error instanceof Error) {
    toast.warning(error.message)
  } else if (error && typeof error === "object" && "message" in error) {
    const msg = (error as Record<string, unknown>).message
    toast.warning(typeof msg === "string" ? msg : "Warning")
  } else {
    toast.warning("Warning")
  }
}

/**
 * Safe wrapper for toast info
 */
export function safeToastInfo(message: string): void {
  toast.info(message)
}
