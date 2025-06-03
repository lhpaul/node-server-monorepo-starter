/**
 * Waits for a specified number of milliseconds
 * @param ms - The number of milliseconds to wait
 * @returns Promise resolving when the wait is complete
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms) );
}