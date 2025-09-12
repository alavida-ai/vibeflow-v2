import { Search, Image, FileText, Users, BarChart3, Brain, Database, Mail, MessageSquare, TrendingUp } from "lucide-react";

// Workflow step configuration interface
export interface WorkflowStepConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  getResultText?: (result: any) => string;
  getProgressText?: (result: any) => string;
}

// Helper function to create workflow configurations
export const createWorkflowConfig = (steps: WorkflowStepConfig[]): WorkflowStepConfig[] => steps;

// Twitter Framework Analysis Workflow
export const TWITTER_FRAMEWORK_ANALYSIS_CONFIG = createWorkflowConfig([
  {
    id: 'twitter-scraper',
    name: 'Scraping Tweets',
    description: 'Collecting Twitter data for analysis',
    icon: Search,
    getResultText: (result) => result?.totalTweets ? `${result.totalTweets} tweets collected` : 'Tweets collected',
    getProgressText: () => 'Analyzing Twitter profile...'
  },
  {
    id: 'generate-media-descriptions',
    name: 'Processing Media',
    description: 'Generating AI descriptions for media content',
    icon: Image,
    getResultText: (result) => result?.mediaProcessed ? `${result.mediaProcessed} media items processed` : 'Media processed',
    getProgressText: () => 'Processing images and videos...'
  },
  {
    id: 'framework-analysis',
    name: 'Analyzing Frameworks',
    description: 'Extracting content patterns from Twitter data',
    icon: FileText,
    getResultText: () => 'Content patterns identified',
    getProgressText: () => 'Identifying content frameworks...'
  },
  {
    id: 'parse-frameworks',
    name: 'Processing Frameworks',
    description: 'Structuring discovered patterns',
    icon: Users,
    getResultText: (result) => result?.frameworks?.length ? `${result.frameworks.length} frameworks extracted` : 'Frameworks structured',
    getProgressText: () => 'Structuring framework data...'
  },
  {
    id: 'calculate-metrics',
    name: 'Computing Metrics',
    description: 'Calculating engagement statistics',
    icon: BarChart3,
    getResultText: (result) => result?.frameworks?.length ? `Metrics calculated for ${result.frameworks.length} frameworks` : 'Metrics calculated',
    getProgressText: () => 'Computing engagement metrics...'
  }
]);

// Example: Content Generation Workflow
export const CONTENT_GENERATION_CONFIG = createWorkflowConfig([
  {
    id: 'research-topics',
    name: 'Research Topics',
    description: 'Finding trending topics and insights',
    icon: TrendingUp,
    getResultText: (result) => result?.topicsFound ? `${result.topicsFound} topics researched` : 'Topics researched',
    getProgressText: () => 'Researching trending topics...'
  },
  {
    id: 'generate-content',
    name: 'Generate Content',
    description: 'Creating content based on research',
    icon: Brain,
    getResultText: (result) => result?.contentPieces ? `${result.contentPieces} content pieces generated` : 'Content generated',
    getProgressText: () => 'Generating content...'
  },
  {
    id: 'optimize-content',
    name: 'Optimize Content',
    description: 'Optimizing content for platforms',
    icon: MessageSquare,
    getResultText: (result) => result?.optimizedPosts ? `${result.optimizedPosts} posts optimized` : 'Content optimized',
    getProgressText: () => 'Optimizing for platforms...'
  }
]);

// Example: Email Campaign Workflow
export const EMAIL_CAMPAIGN_CONFIG = createWorkflowConfig([
  {
    id: 'segment-audience',
    name: 'Segment Audience',
    description: 'Analyzing and segmenting email list',
    icon: Users,
    getResultText: (result) => result?.segments ? `${result.segments} segments created` : 'Audience segmented',
    getProgressText: () => 'Segmenting audience...'
  },
  {
    id: 'generate-email-content',
    name: 'Generate Email',
    description: 'Creating personalized email content',
    icon: Mail,
    getResultText: (result) => result?.emailsGenerated ? `${result.emailsGenerated} emails generated` : 'Emails generated',
    getProgressText: () => 'Generating email content...'
  },
  {
    id: 'schedule-campaign',
    name: 'Schedule Campaign',
    description: 'Scheduling and setting up campaign',
    icon: Database,
    getResultText: (result) => result?.scheduled ? 'Campaign scheduled successfully' : 'Campaign scheduled',
    getProgressText: () => 'Scheduling campaign...'
  }
]);

// Main workflow configurations registry
export const WORKFLOW_CONFIGS: Record<string, WorkflowStepConfig[]> = {
  'twitter-framework-analysis': TWITTER_FRAMEWORK_ANALYSIS_CONFIG,
  'content-generation': CONTENT_GENERATION_CONFIG,
  'email-campaign': EMAIL_CAMPAIGN_CONFIG,
};

// Helper function to register a new workflow configuration
export const registerWorkflowConfig = (workflowId: string, config: WorkflowStepConfig[]) => {
  WORKFLOW_CONFIGS[workflowId] = config;
};

// Helper function to get workflow configuration
export const getWorkflowConfig = (workflowId: string): WorkflowStepConfig[] => {
  return WORKFLOW_CONFIGS[workflowId] || [];
};
