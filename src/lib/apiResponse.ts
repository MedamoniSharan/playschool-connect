/** Parse API Gateway / Lambda proxy payloads — direct JSON, string body, or object body */
export function parseApiResponse(raw: unknown): Record<string, unknown> {
  if (raw === null || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  if (typeof obj.body === "string") {
    try {
      const inner = JSON.parse(obj.body) as unknown;
      return typeof inner === "object" && inner !== null ? (inner as Record<string, unknown>) : {};
    } catch {
      return obj;
    }
  }
  if (obj.body !== undefined && typeof obj.body === "object" && obj.body !== null && !Array.isArray(obj.body)) {
    return obj.body as Record<string, unknown>;
  }
  return obj;
}
