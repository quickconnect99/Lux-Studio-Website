/**
 * Serializes structured data for an inline JSON-LD script without allowing
 * CMS content containing "<" to terminate the script element.
 */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
