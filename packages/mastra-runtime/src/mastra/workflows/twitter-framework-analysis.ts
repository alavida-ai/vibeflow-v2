import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { RuntimeContext } from "@mastra/core/runtime-context";
import { Mastra } from "@mastra/core";
import { AnalyzerService } from "@vibeflow/core";
import { TwitterAnalyser } from '@vibeflow/ingestion';

type WorkflowContext = {
  username: string;
  threadId: string;
  resourceId: string;
};

// Schema for the final Framework interface
const FrameworkSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  structure: z.string(),
  promptTemplate: z.string(),
  metrics: z.object({
    avgViews: z.number(),
    avgLikes: z.number(),
    avgRetweets: z.number(),
    avgReplies: z.number(),
    avgQuotes: z.number(),
    avgBookmarks: z.number()
  })
});

const FrameworksArraySchema = z.array(FrameworkSchema);

const twitterScraperStep = createStep({
  id: "twitter-scraper",
  description: "Scrape Twitter user and get tweet data without processing media",
  inputSchema: z.object({
    username: z.string()
  }),
  outputSchema: z.object({
    totalTweets: z.number(),
    username: z.string()
  }),
  execute: async ({ inputData, mastra, runtimeContext }: {
    inputData: { username: string },
    mastra: Mastra,
    runtimeContext: RuntimeContext<WorkflowContext>
  }) => {
    const stepId = "twitter-scraper";
    const logger = mastra.getLogger();

    logger.info(`Starting twitter scraper step`, {
      stepId,
      username: inputData.username,
      timestamp: new Date().toISOString()
    });

    const { username } = inputData;

    try {
      const twitterAnalyser = new TwitterAnalyser({
        userName: username,
        maxPages: 10,
        processMedia: false
      });
      const tweetsForOutput = await twitterAnalyser.run();

      // Validate the response
      if (!tweetsForOutput || !tweetsForOutput.ingestionResult) {
        throw new Error('Twitter analysis returned invalid result');
      }

      const totalTweets = tweetsForOutput.ingestionResult.totalTweets ?? 0;

      console.log(`✅ Twitter analysis completed. Total tweets: ${totalTweets}`);

      return {
        totalTweets: totalTweets,
        username: username
      };
    } catch (error) {
      console.error('❌ Twitter scraper tool failed:', error);
      throw new Error(`Failed to scrape tweets: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

const generateMediaDescriptionsStep = createStep({
  id: "generate-media-descriptions",
  description: "Generate AI descriptions for media in the best performing tweets",
  inputSchema: z.object({
    totalTweets: z.number(),
    username: z.string()
  }),
  outputSchema: z.object({
    mediaProcessed: z.number(),
    username: z.string()
  }),
  execute: async ({ inputData, mastra, runtimeContext }: {
    inputData: { totalTweets: number, username: string },
    mastra: Mastra,
    runtimeContext: RuntimeContext<WorkflowContext>
  }) => {
    const stepId = "generate-media-descriptions";
    const logger = mastra.getLogger();

    logger.info(`Starting media descriptions generation step`, {
      stepId,
      username: inputData.username,
      timestamp: new Date().toISOString()
    });

    try {
      // Import TwitterAnalyser and generate media descriptions for best 10 tweets
      const { TwitterAnalyser } = await import('@vibeflow/ingestion');

      const twitterAnalyser = new TwitterAnalyser({
        userName: inputData.username,
        maxPages: 1, // Not used since we're only calling generateMediaDescriptions
        processMedia: false // Not used since we're calling the method directly
      });

      // Generate media descriptions for the best 10 tweets
      const mediaProcessed = await twitterAnalyser.generateMediaDescriptions(10);

      logger.info('Media descriptions generation completed', {
        stepId,
        username: inputData.username,
        mediaProcessed
      });

      return {
        mediaProcessed,
        username: inputData.username
      };
    } catch (error) {
      logger.error('Media descriptions generation failed', {
        stepId,
        username: inputData.username,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      // Return 0 media processed if it fails, but don't fail the workflow
      return {
        mediaProcessed: 0,
        username: inputData.username
      };
    }
  }
});

// Step 3: Framework Analysis using existing frameworkAgent
const frameworkAnalysisStep = createStep({
  id: "framework-analysis",
  description: "Analyze Twitter user and extract content frameworks with tweet references",
  inputSchema: z.object({
    username: z.string(),
    mediaProcessed: z.number()
  }),
  outputSchema: z.object({
    rawAnalysis: z.string(),
    username: z.string()
  }),
  execute: async ({ inputData, mastra, runtimeContext }: {
    inputData: { username: string },
    mastra: Mastra,
    runtimeContext: RuntimeContext<WorkflowContext>
  }) => {
    const stepId = "framework-analysis";
    const startTime = Date.now();

    const logger = mastra.getLogger();

    logger.info(`Starting framework analysis step`, {
      stepId,
      username: inputData.username,
      timestamp: new Date().toISOString()
    });

    const { username } = inputData;

    // Set context
    runtimeContext.set("username", username);
    runtimeContext.set("threadId", `framework-analysis-${Date.now()}`);
    runtimeContext.set("resourceId", `user-${username}`);

    const contextData = {
      username,
      threadId: runtimeContext.get("threadId"),
      resourceId: runtimeContext.get("resourceId")
    };

    logger.debug('Context set for framework analysis', { stepId, contextData });

    const frameworkAgent = mastra.getAgent("frameworkAgent");
    logger.debug('Framework agent retrieved', { stepId, agentName: "frameworkAgent" });

    const prompt = `Analyze Twitter user @${username} and identify their content frameworks. 

IMPORTANT: For each framework you extract, you MUST include the specific tweet IDs that demonstrate this framework. Reference the tweets by their IDs from the userTweetsFetcherTool data.

Format your response to clearly show:
1. Framework title and description
2. Framework structure/pattern
3. Prompt template for using this framework
4. Tweet IDs that demonstrate this framework

Use the userTweetsFetcherTool to get the tweet data - no need to scrape since there should be enough data available.`;

    let result;
    try {
      logger.info('Calling framework agent generate method', { stepId });

      result = await frameworkAgent.generate(prompt, {
        memory: {
          thread: {
            id: runtimeContext.get("threadId"),
          },
          resource: runtimeContext.get("resourceId")
        }
      });

      // Also log a structured analysis of the response
      logger.debug('Framework agent response analysis', {
        stepId,
        username,
        responseStats: {
          length: result.text.length,
          containsTweetIds: /\b\d{19}\b/.test(result.text), // Check for Twitter ID pattern
          tweetIdMatches: result.text.match(/\b\d{19}\b/g) || [],
          containsFramework: result.text.toLowerCase().includes('framework'),
          lineCount: result.text.split('\n').length
        }
      });

    } catch (error) {
      logger.error('Framework agent generation failed', {
        stepId,
        username,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      if (error instanceof Error && error.message.includes('Payment Required')) {
        const paymentError = new Error('OpenRouter API payment required. Please check your API key and account balance.');
        logger.error('Payment required error detected', { stepId, error: paymentError.message });
        throw paymentError;
      }
      throw error;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.info('Framework analysis step completed', {
      stepId,
      username,
      duration,
    });

    return {
      rawAnalysis: result.text,
      username
    };
  }
});

// Step 2: Parse the raw analysis into structured format
const parseFrameworksStep = createStep({
  id: "parse-frameworks",
  description: "Parse raw framework analysis into structured format",
  inputSchema: z.object({
    rawAnalysis: z.string(),
    username: z.string()
  }),
  outputSchema: z.object({
    frameworks: z.array(z.object({
      title: z.string(),
      description: z.string(),
      structure: z.string(),
      promptTemplate: z.string(),
      tweetIds: z.array(z.string())
    })),
    username: z.string()
  }),
  execute: async ({ inputData, mastra, runtimeContext }: {
    inputData: { rawAnalysis: string, username: string },
    mastra: Mastra,
    runtimeContext: RuntimeContext<WorkflowContext>
  }) => {
    const stepId = "parse-frameworks";
    const startTime = Date.now();
    const logger = mastra.getLogger();

    const { rawAnalysis, username } = inputData;

    const parseAgent = mastra.getAgent("parseAgent");

    const prompt = `Parse the following framework analysis into structured JSON format:

${rawAnalysis}

Remember to extract the tweet IDs that each framework references.`;

    let result;
    try {
      logger.info('Calling parse agent generate method', { stepId });

      result = await parseAgent.generate(prompt, {
        memory: {
          thread: {
            id: runtimeContext.get("threadId"),
          },
          resource: runtimeContext.get("resourceId")
        }
      });

      logger.info('Parse agent generation completed - FULL RESPONSE', {
        stepId,
        username,
        responseLength: result.text.length,
        fullResponse: result.text // Complete response without truncation
      });

    } catch (error) {
      logger.error('Parse agent generation failed', {
        stepId,
        username,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }

    let parsedFrameworks;
    try {
      logger.debug('Starting JSON parsing', { stepId });

      // Clean and parse the JSON response
      let jsonText = result.text.trim();

      logger.debug('Raw JSON text extracted', {
        stepId,
        jsonTextLength: jsonText.length,
        jsonTextPreview: jsonText.substring(0, 300) + "..."
      });

      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        logger.debug('Removed markdown json code blocks', { stepId });
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
        logger.debug('Removed markdown code blocks', { stepId });
      }

      const parsed = JSON.parse(jsonText);
      parsedFrameworks = parsed.frameworks || [];

      logger.info('JSON parsing successful', {
        stepId,
        frameworksCount: parsedFrameworks.length,
        frameworks: parsedFrameworks.map((f: any) => ({
          title: f.title,
          tweetIdsCount: f.tweetIds?.length || 0,
          tweetIds: f.tweetIds || []
        }))
      });

    } catch (error) {
      logger.error('Failed to parse framework JSON', {
        stepId,
        error: error instanceof Error ? error.message : String(error),
        rawResponse: result.text.substring(0, 1000) + "..." // Show more of the response for debugging
      });
      parsedFrameworks = [];
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.info('Parse frameworks step completed', {
      stepId,
      username,
      duration,
      frameworksCount: parsedFrameworks.length,
      outputSize: JSON.stringify({ frameworks: parsedFrameworks, username }).length
    });

    return {
      frameworks: parsedFrameworks,
      username
    };
  }
});

// Step 3: Calculate metrics from tweet data
const calculateMetricsStep = createStep({
  id: "calculate-metrics",
  description: "Calculate framework metrics from referenced tweets",
  inputSchema: z.object({
    frameworks: z.array(z.object({
      title: z.string(),
      description: z.string(),
      structure: z.string(),
      promptTemplate: z.string(),
      tweetIds: z.array(z.string())
    })),
    username: z.string()
  }),
  outputSchema: z.object({
    frameworks: FrameworksArraySchema,
    totalPosts: z.number(),
    username: z.string()
  }),
  execute: async ({ inputData, mastra }: {
    inputData: {
      frameworks: Array<{
        title: string,
        description: string,
        structure: string,
        promptTemplate: string,
        tweetIds: string[]
      }>,
      username: string
    },
    mastra: Mastra
  }) => {
    const stepId = "calculate-metrics";
    const startTime = Date.now();
    const logger = mastra.getLogger();

    logger.info('Starting calculate metrics step', {
      stepId,
      username: inputData.username,
      frameworksCount: inputData.frameworks.length
    });

    const { frameworks, username } = inputData;

    let totalPosts = 0;

    const enrichedFrameworks = await Promise.all(
      frameworks.map(async (framework, index) => {
        const frameworkStartTime = Date.now();
        
        logger.debug(`Processing framework ${index + 1}: ${framework.title}`, {
          stepId,
          frameworkIndex: index + 1,
          title: framework.title,
          tweetIdsCount: framework.tweetIds?.length || 0,
          tweetIds: framework.tweetIds
        });

        let avgViews = 0;
        let avgLikes = 0;
        let avgRetweets = 0;
        let avgReplies = 0;
        let avgQuotes = 0;
        let avgBookmarks = 0;

        if (framework.tweetIds && framework.tweetIds.length > 0) {
          try {
            // Convert string IDs to integers for database lookup
            const tweetDbIds = framework.tweetIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
            
            totalPosts += tweetDbIds.length;

            // Fetch tweets by their internal database IDs
            const tweets = await AnalyzerService.getTweetsByIds(tweetDbIds);

            if (tweets.length > 0) {
              const totalViews = tweets.reduce((sum, tweet) => sum + (tweet.viewCount || 0), 0);
              const totalLikes = tweets.reduce((sum, tweet) => sum + (tweet.likeCount || 0), 0);
              const totalRetweets = tweets.reduce((sum, tweet) => sum + (tweet.retweetCount || 0), 0);
              const totalReplies = tweets.reduce((sum, tweet) => sum + (tweet.replyCount || 0), 0);
              const totalQuotes = tweets.reduce((sum, tweet) => sum + (tweet.quoteCount || 0), 0);
              const totalBookmarks = tweets.reduce((sum, tweet) => sum + (tweet.bookmarkCount || 0), 0);


              avgViews = Math.round(totalViews / tweets.length);
              avgLikes = Math.round(totalLikes / tweets.length);
              avgRetweets = Math.round(totalRetweets / tweets.length);
              avgReplies = Math.round(totalReplies / tweets.length);
              avgQuotes = Math.round(totalQuotes / tweets.length);
              avgBookmarks = Math.round(totalBookmarks / tweets.length);


            } else {
              logger.warn(`No tweets found for framework: ${framework.title}`, {
                stepId,
                title: framework.title,
                requestedTweetIds: framework.tweetIds
              });
            }
          } catch (error) {
            logger.error(`Failed to fetch tweets for framework: ${framework.title}`, {
              stepId,
              title: framework.title,
              tweetIds: framework.tweetIds,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined
            });

            logger.debug(`Using fallback metrics for framework: ${framework.title}`, {
              stepId,
              title: framework.title,
              fallbackAvgViews: avgViews,
              fallbackAvgLikes: avgLikes
            });
          }
        } else {
          logger.warn(`No tweet IDs provided for framework: ${framework.title}`, {
            stepId,
            title: framework.title,
            fallbackAvgViews: avgViews,
            fallbackAvgLikes: avgLikes
          });
        }

        const frameworkEndTime = Date.now();
        const frameworkDuration = frameworkEndTime - frameworkStartTime;

        const enrichedFramework = {
          id: `${index + 1}`,
          title: framework.title,
          description: framework.description,
          structure: framework.structure,
          promptTemplate: framework.promptTemplate,
          metrics: {
            avgViews,
            avgLikes,
            avgRetweets,
            avgReplies,
            avgQuotes,
            avgBookmarks
          }
        };

        return enrichedFramework;
      })
    );

    logger.debug('All frameworks processed', {
      stepId,
      enrichedFrameworksCount: enrichedFrameworks.length
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    const output = {
      frameworks: enrichedFrameworks,
      totalPosts,
      username
    };

    logger.info('Calculate metrics step completed', {
      stepId,
      username,
      duration,
      frameworksCount: enrichedFrameworks.length,
      totalPosts,
      finalFrameworks: enrichedFrameworks.map(f => ({
        id: f.id,
        title: f.title,
        metrics: f.metrics
      }))
    });

    return output;
  }
});

// Create the workflow
export const twitterFrameworkAnalysisWorkflow = createWorkflow({
  id: "twitter-framework-analysis",
  description: "Analyze Twitter user content and extract frameworks with metrics",
  inputSchema: z.object({
    username: z.string()
  }),
  outputSchema: z.object({
    frameworks: FrameworksArraySchema,
    totalPosts: z.number(),
    username: z.string()
  })
})
  .then(twitterScraperStep)
  .then(generateMediaDescriptionsStep)
  .then(frameworkAnalysisStep)
  .then(parseFrameworksStep)
  .then(calculateMetricsStep)
  .commit();
