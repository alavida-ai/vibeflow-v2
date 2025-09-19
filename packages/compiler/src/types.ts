export interface CompileOptions {
  srcDir: string; // e.g., studio/workflows
  outDir: string; // e.g., .mastra/out
}

export interface ManifestWorkflowEntry {
  id: string;
  path: string; // relative path from outDir, e.g., workflows/publish_tweet.json
  hash: string; // content hash for change detection
}

export interface ManifestAgentEntry {
  id: string;
  path: string; // relative path from outDir, e.g., agents/content_reviewer.json
  hash: string; // content hash for change detection
}

export interface Manifest {
  generatedAt: string;
  workflows: ManifestWorkflowEntry[];
  agents: ManifestAgentEntry[];
}


