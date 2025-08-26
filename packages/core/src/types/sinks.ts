export interface SlackSinkConfig {
  webhookUrl?: string;
  webhook_url?: string; // Support both naming conventions
  token?: string;
  channel: string;
}

// Sink Result Types
export interface SinkResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  metadata?: any;
}

// Slack Message Types
export interface SlackMessagePayload {
  text?: string;
  blocks?: SlackBlock[];
  channel?: string;
  username?: string;
  icon_emoji?: string;
  icon_url?: string;
}

export interface SlackBlock {
  type: 'section' | 'divider' | 'header' | 'actions' | 'context' | 'image';
  text?: {
    type: 'mrkdwn' | 'plain_text';
    text: string;
  };
  fields?: Array<{
    type: 'mrkdwn' | 'plain_text';
    text: string;
  }>;
  accessory?: {
    type: string;
    [key: string]: any;
  };
  elements?: any[];
  image_url?: string;
  alt_text?: string;
}
