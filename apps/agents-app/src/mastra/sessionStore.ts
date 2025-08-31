const map = new Map<string, string>();

// Always returns your app-level session id for a given MCP session id
export function getAppSessionId(mcpSessionId?: string) {
    try {
  // If MCP didn't give you one (edge cases), just make a standalone id
  if (!mcpSessionId) return crypto.randomUUID();

  let appSid = map.get(mcpSessionId);
  if (!appSid) {
            throw new Error("No app session id found for mcp session id");
        }
        return appSid;
    } catch (error) {
        throw new Error("No app session id found for mcp session id");
    }
}

// Optional (debug)
export function listSessions() {
  return Array.from(map.entries()).map(([mcp, app]) => ({ mcpSessionId: mcp, appSessionId: app }));
}