export function v3Enabled(enabled?: boolean) {
  return enabled ?? import.meta.content?.v3Compatibility ?? true
}
