import { schema } from '@brand-listener/database';
import { type SlackMessagePayload } from '@brand-listener/core';
import { getMostRelevantTweetsToReplyTo, TweetCandidate } from '@brand-listener/core/services/database';

/* -------------------------------------------------------------------------- */
/*                       SLACK MESSAGE BUILDERS                               */
/* -------------------------------------------------------------------------- */

export function buildTweetNotificationMessage(tweet: schema.Tweet): SlackMessagePayload {
    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `🆕 New tweet mention from *${tweet.authorName || tweet.authorUsername}* (@${tweet.authorUsername})`
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `> ${tweet.text}`
            }
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `👥 ${tweet.authorFollowers?.toLocaleString() || 0} followers • 📅 ${new Date(tweet.createdAtUtc).toLocaleString()}`
                }
            ]
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: { type: 'plain_text', text: '🔗 View Tweet' },
                    url: tweet.tweetUrl,
                    style: 'primary'
                },
                {
                    type: 'button',
                    text: { type: 'plain_text', text: '👤 Profile' },
                    url: `https://twitter.com/${tweet.authorUsername}`
                }
            ]
        }
    ] as SlackMessagePayload['blocks'];

    return {
        text: `New mention by @${tweet.authorUsername}`,
        blocks
    };
}

export function buildReportSummaryMessage(summary: {
    total: number;
    mentions: number;
    keywords: number;
}): SlackMessagePayload {
    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `🎯 *Brand Monitoring Report*\n${summary.total} total • ${summary.mentions} mentions • ${summary.keywords} keywords`
            }
        },
        { type: 'divider' }
    ] as SlackMessagePayload['blocks'];

    return {
        text: `Brand Monitoring: ${summary.total} new items` ,
        blocks
    };
}

function escapeSlackText(text: string): string {
    // Escape special characters for Slack mrkdwn
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function buildMostRelevantTweetsReport(tweetCandidates: TweetCandidate[]): SlackMessagePayload {
    const header = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: '🎯 *Most Relevant Tweets to Reply To*'
        }
    } as const;

    const divider = { type: 'divider' } as const;

    const tweetBlocks = tweetCandidates.map((candidate, index) => {
        const { tweet, analytics } = candidate;
        const rank = index + 1;
        
        // Calculate age in hours
        const ageInHours = Math.round(parseFloat(analytics.ageInHours));
        

        // Score (simplified, avoiding complex breakdown that might be too long)
        const score = parseFloat(analytics.finalScore).toFixed(2);

        return [
            {
                type: 'section',
                fields: [
                    {
                        type: 'mrkdwn',
                        text: `*#${rank}* • @${tweet.authorUsername}\n${tweet.authorFollowers?.toLocaleString() || 0} followers • ${ageInHours}h old`
                    }
                ]
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Engagement:* Score: ${score} • ${tweet.replyCount} replies • ${tweet.quoteCount} quotes • ${tweet.retweetCount} RTs • ${tweet.likeCount} likes • ${tweet.viewCount} views`
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Draft Reply:* "${tweet.reply}"`
                }
            },
            {
                type: 'actions',
                elements: [
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: '💬 Reply to Tweet' },
                        url: `https://twitter.com/intent/tweet?in_reply_to=${tweet.tweetId}&text=${encodeURIComponent(tweet.reply || 'No draft reply')}`,
                        style: 'primary'
                    },
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: '🔗 View Tweet' },
                        url: tweet.tweetUrl
                    },
                    {
                        type: 'button',
                        text: { type: 'plain_text', text: '👤 Profile' },
                        url: `https://twitter.com/${tweet.authorUsername}`
                    }
                ]
            },
            { type: 'divider' }
        ];
    }).flat();

    // Remove last divider
    if (tweetBlocks.length > 0) {
        tweetBlocks.pop();
    }

    const blocks = [header, divider, ...tweetBlocks];

    return {
        text: `Most Relevant Tweets Report - ${tweetCandidates.length} tweets`,
        blocks: blocks as SlackMessagePayload['blocks']
    };
}

async function main() {
    const tweets = await getMostRelevantTweetsToReplyTo({ top_k: 20 });
    
    // Generate the report
    const report = buildMostRelevantTweetsReport(tweets);
    console.log('Generated Slack Report:');
    console.log(JSON.stringify(report, null, 2));
}

main();