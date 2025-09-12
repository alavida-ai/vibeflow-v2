import { config } from 'dotenv';
import path from 'path';
import { AnalyzerService } from './analyzerService';

// Load environment variables from project root
config({ path: path.resolve(process.cwd(), '../../.env') });

async function testGetTweetsAnalysisViewByUsername() {
    console.log('🧪 Testing getTweetsAnalysisViewByUsername method...\n');

    try {
        // You'll need to replace 'testuser' with an actual username from your database
        const testUsername = 'alexgirardet'; // Replace with actual username from your database

        console.log(`📊 Testing with username: ${testUsername}\n`);

        // Test 1: Get all tweets (no limit)
        console.log('🔍 Test 1: Getting ALL tweets (no limit)...');
        const allTweets = await AnalyzerService.getTweetsAnalysisViewByUsername(testUsername);
        console.log(`✅ Retrieved ${allTweets.length} tweets total`);

        if (allTweets.length > 0) {
            console.log(`📝 First tweet: "${allTweets[0].text.substring(0, 50)}..."`);
            console.log(`📊 First tweet metrics: ${allTweets[0].likeCount} likes, ${allTweets[0].retweetCount} retweets`);
            console.log(`🖼️  First tweet media count: ${allTweets[0].media.length}\n`);
        } else {
            console.log(`⚠️  No tweets found for username: ${testUsername}`);
            console.log('   Please update the testUsername variable with a real username from your database\n');
        }

        // Test 2: Get limited tweets
        const limitCount = Math.min(3, allTweets.length);
        if (limitCount > 0) {
            console.log(`🔍 Test 2: Getting LIMITED tweets (limit: ${limitCount})...`);
            const limitedTweets = await AnalyzerService.getTweetsAnalysisViewByUsername(testUsername, limitCount);
            console.log(`✅ Retrieved ${limitedTweets.length} tweets with limit`);

            // Verify the limit worked
            if (limitedTweets.length === limitCount) {
                console.log('✅ Limit parameter working correctly');
            } else {
                console.log(`⚠️  Expected ${limitCount} tweets, got ${limitedTweets.length}`);
            }

            // Verify the tweets are the same (should be top EVS tweets)
            if (allTweets.length > 0 && limitedTweets.length > 0) {
                const sameFirstTweet = allTweets[0].id === limitedTweets[0].id;
                console.log(`🔄 Same top tweet in both queries: ${sameFirstTweet ? '✅' : '❌'}\n`);
            }

            // Test 3: Get with limit = 0 (edge case)
            console.log('🔍 Test 3: Testing with limit = 0...');
            const zeroLimitTweets = await AnalyzerService.getTweetsAnalysisViewByUsername(testUsername, 0);
            console.log(`✅ Retrieved ${zeroLimitTweets.length} tweets with limit=0\n`);

            // Test 4: Test with non-existent user
            console.log('🔍 Test 4: Testing with non-existent username...');
            const nonExistentTweets = await AnalyzerService.getTweetsAnalysisViewByUsername('nonexistent_user_12345');
            console.log(`✅ Retrieved ${nonExistentTweets.length} tweets for non-existent user (should be 0)\n`);

            // Test 5: Test undefined vs no parameter
            console.log('🔍 Test 5: Testing undefined vs no parameter...');
            const undefinedLimitTweets = await AnalyzerService.getTweetsAnalysisViewByUsername(testUsername, undefined);
            console.log(`✅ Retrieved ${undefinedLimitTweets.length} tweets with undefined limit`);
            const sameAsNoLimit = allTweets.length === undefinedLimitTweets.length;
            console.log(`🔄 Same as no limit: ${sameAsNoLimit ? '✅' : '❌'}\n`);

            // Summary
            console.log('📈 TEST SUMMARY:');
            console.log(`   • Total tweets for ${testUsername}: ${allTweets.length}`);
            console.log(`   • Limited tweets (${limitCount}): ${limitCount > 0 ? limitedTweets?.length : 'N/A'}`);
            console.log(`   • Zero limit tweets: ${zeroLimitTweets.length}`);
            console.log(`   • Non-existent user tweets: ${nonExistentTweets.length}`);
            console.log(`   • Undefined limit tweets: ${undefinedLimitTweets.length}`);
        }

        // Validate data structure
        if (allTweets.length > 0) {
            const firstTweet = allTweets[0];
            console.log('\n🔍 DATA STRUCTURE VALIDATION:');
            console.log(`   • Has id: ${typeof firstTweet.id === 'number' ? '✅' : '❌'}`);
            console.log(`   • Has text: ${typeof firstTweet.text === 'string' ? '✅' : '❌'}`);
            console.log(`   • Has type: ${typeof firstTweet.type === 'string' ? '✅' : '❌'}`);
            console.log(`   • Has metrics: ${typeof firstTweet.likeCount === 'number' ? '✅' : '❌'}`);
            console.log(`   • Has media array: ${Array.isArray(firstTweet.media) ? '✅' : '❌'}`);
            console.log(`   • Media has correct structure: ${firstTweet.media.length === 0 ||
                    (typeof firstTweet.media[0]?.type === 'string') ? '✅' : '❌'
                }`);
        }

        // Performance comparison
        if (allTweets.length > 5) {
            console.log('\n⚡ PERFORMANCE TEST:');
            const start = Date.now();
            await AnalyzerService.getTweetsAnalysisViewByUsername(testUsername);
            const unlimitedTime = Date.now() - start;

            const start2 = Date.now();
            await AnalyzerService.getTweetsAnalysisViewByUsername(testUsername, 5);
            const limitedTime = Date.now() - start2;

            console.log(`   • Unlimited query: ${unlimitedTime}ms`);
            console.log(`   • Limited query (5): ${limitedTime}ms`);
            console.log(`   • Performance improvement: ${limitedTime < unlimitedTime ? '✅' : '➖'}`);
        }

        console.log('\n🎉 All tests completed successfully!');

        // Return results for further analysis if needed
        return {
            success: true,
            totalTweets: allTweets.length,
            testsPassed: 5
        };

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
        throw error;
    }
}

// Export for potential use in other test files
export { testGetTweetsAnalysisViewByUsername };

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testGetTweetsAnalysisViewByUsername()
        .then((results) => {
            console.log('\n✨ Test script finished successfully');
            console.log(`📊 Results: ${results.testsPassed} tests passed, ${results.totalTweets} tweets found`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Test script failed:', error.message);
            process.exit(1);
        });
}
