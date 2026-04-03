/**
 * ANSI Escape sequences for terminal coloring and styling.
 * Used to provide a premium and consistent CLI experience.
 */
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

/**
 * Formats a message with the boltdocs prefix and provided styling.
 *
 * @param message - The content to log
 * @param style - Optional ANSI style prefix
 * @returns The formatted string
 */
export function formatLog(message: string, style: string = ''): string {
  return `${style}${colors.bold}[boltdocs]${colors.reset} ${message}${colors.reset}`
}

/**
 * Logs a standard informational message to the console.
 *
 * @param message - The message to display
 */
export function info(message: string) {
  console.log(formatLog(message))
}

/**
 * Logs an error message to the console with red styling.
 *
 * @param message - The error description
 * @param error - Optional error object for stack tracing
 */
export function error(message: string, error?: any) {
  console.error(formatLog(message, colors.red))
  if (error) console.error(error)
}

/**
 * Logs a success message to the console with green styling.
 *
 * @param message - The success description
 */
export function success(message: string) {
  console.log(formatLog(message, colors.green))
}
