
/* -------------------------------------------------------------------------- */
/*                              TYPES                                         */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              CLIENT                                         */
/* -------------------------------------------------------------------------- */

export class SlackClient {
  private readonly webhookUrl: string;

  constructor(webhookUrl: string) {
    if (!webhookUrl) {
      throw new Error('Webhook URL is required');
    }
    this.webhookUrl = webhookUrl;
  }

  async postMessage(message: SlackMessagePayload): Promise<{ ok: boolean; status: number; body: string }> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Failed to post message to Slack: ${response.statusText} ${body}`);
    }

    const body = await response.text();
    console.log('Slack response:', body);
    return { 
      ok: response.ok, 
      status: response.status, 
      body 
    };
  }

  async postText(text: string): Promise<{ ok: boolean; status: number; body: string }> {
    return this.postMessage({ text });
  }
}