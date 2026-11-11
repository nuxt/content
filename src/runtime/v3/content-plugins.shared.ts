export function v3Enabled(enabled?: boolean) {
  return enabled ?? (import.meta.content?.compatibilityVersion ?? 3) === 3
}
