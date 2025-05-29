export function mergeHeaders(
  base?: Record<string, string>,
  additional?: Record<string, string>
): Record<string, string> {
  return { ...(base || {}), ...(additional || {}) };
}