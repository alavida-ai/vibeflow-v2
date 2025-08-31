```mermaid
flowchart LR
  subgraph Hono Server (localhost)
    MCP[/MCP endpoint /mcp/]
    SR[(SessionRegistry)]
    INJ[RuntimeContext Injector (per request)]
    ORCH[Core Orchestration (MastraClient)]
    WF[Mastra Workflows (agents pkg)]
  end

  Cursor[(Cursor MCP Client)]
  Repo[(Local Files)]

  Cursor <--> MCP
  MCP <---> SR
  MCP --> INJ
  INJ --> ORCH
  ORCH --> WF
  Cursor <--> Repo
  ```
