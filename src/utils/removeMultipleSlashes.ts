/**
 * Removes multiple consecutive slashes from a string, preserving protocol slashes (e.g., http://).
 * @param str The input string, typically a URL or path.
 * @returns The string with multiple slashes reduced to a single slash.
 * @example
 * removeMultipleSlashes("http://example.com//api///data"); // "http://example.com/api/data"
 */
export function removeMultipleSlashes(str: string): string {
  if (!str) return str;
  return str.replace(/(?<!https?:)\/+/g, "/").replace(/\/$/, "");;
}
