import { TwitterApiTweet, LastTweetsApiResponse } from "../client/twitter";
import { schema } from "@vibeflow/database";


// HACK: This is a hack to get the analyzer response into the correct format
// TODO: Merge with method in listenerTransformer.ts
export function transformTwitterAnalyzerResponse(apiResponse: LastTweetsApiResponse): {
  tweets: schema.InsertTweetAnalyzerWithMedia[];
  hasNextPage: boolean;
  nextCursor?: string | null;
} {
  const transformedTweets = apiResponse.data.tweets.map(tweet =>
    transformTweetToAnalyzerDbFormat(tweet)
  );

  return {
    tweets: transformedTweets,
    hasNextPage: apiResponse.has_next_page,
    nextCursor: apiResponse.next_cursor,
  };
}

const transformTweetToAnalyzerDbFormat = (tweet: TwitterApiTweet): schema.InsertTweetAnalyzerWithMedia => {
  const mediaArr = tweet.extendedEntities?.media || [];
  const media = extractMedia(mediaArr);
  const evs = computeEvs(tweet);
  
  // Determine type based on media content
  const type = media.length > 0 ? media[0].type as "text" | "image" | "video" : "text";

  return {
    apiId: tweet.id,
    url: tweet.url,
    text: tweet.text,
    retweetCount: tweet.retweetCount,
    replyCount: tweet.replyCount,
    likeCount: tweet.likeCount,
    quoteCount: tweet.quoteCount,
    viewCount: tweet.viewCount,
    bookmarkCount: tweet.bookmarkCount,
    username: tweet.author.userName,
    type,
    media,
    createdAt: new Date(tweet.createdAt),
    evs,
  };
};

const extractMedia = (mediaArr: any[] | undefined): schema.InsertTweetMediaWithoutTweetId[] => {
  if (!Array.isArray(mediaArr)) return [];
  return mediaArr.map((media) => {
    if (media.type === 'video' && media.video_info && Array.isArray(media.video_info.variants)) {
      // Find the highest-bitrate MP4 variant
      const mp4s = media.video_info.variants.filter((v: any) => v.content_type === 'video/mp4');
      let best = mp4s[0];
      for (const v of mp4s) {
        if (!best || (v.bitrate && (!best.bitrate || v.bitrate > best.bitrate))) {
          best = v;
        }
      }
      return {
        type: 'video',
        url: best.url
      };
    } else {
      // Photo or other
      return {
        type: media.type,
        url: media.media_url_https
      };
    }
  });
};

export const computeEvs = (tweet: TwitterApiTweet): number => {
  const weights = {
    like: 0.10,
    reply: 0.30,
    retweet: 0.20,
    quote: 0.25,
    bookmark: 0.40,
  };
  const scale = 1000;
  const numerator =
    weights.like * tweet.likeCount +
    weights.reply * tweet.replyCount +
    weights.retweet * tweet.retweetCount +
    weights.quote * tweet.quoteCount +
    weights.bookmark * tweet.bookmarkCount;
  return tweet.viewCount > 0 ? Number((scale * numerator / tweet.viewCount).toFixed(4)) : 0;
};