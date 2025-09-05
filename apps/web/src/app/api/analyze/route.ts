import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Call the Mastra Twitter framework analysis workflow
    // First create a workflow run
    const createRunResponse = await fetch('http://localhost:4111/api/workflows/twitterFrameworkAnalysisWorkflow/create-run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!createRunResponse.ok) {
      const errorText = await createRunResponse.text();
      console.error('Failed to create workflow run:', errorText);
      return NextResponse.json(
        { error: 'Failed to create workflow run' },
        { status: createRunResponse.status }
      );
    }

    const { runId } = await createRunResponse.json();

    // Then start the workflow asynchronously and wait for completion
    const response = await fetch(`http://localhost:4111/api/workflows/twitterFrameworkAnalysisWorkflow/start-async?runId=${runId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputData: {
          username: username
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mastra API error:', errorText);
      
      // Handle specific error cases
      if (response.status === 402) {
        return NextResponse.json(
          { error: 'API key configuration required. Please check your OpenRouter API key.' },
          { status: 402 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to analyze Twitter user' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // The workflow start-async returns a result object with status and result
    if (data.status === 'success' && data.result) {
      const result = data.result;
      return NextResponse.json({
        success: true,
        frameworks: result.frameworks || [],
        totalPosts: result.totalPosts || 0,
        username: result.username || username
      });
    } else if (data.status === 'failed') {
      console.error('Workflow failed:', data.error);
      return NextResponse.json({
        success: false,
        frameworks: [],
        totalPosts: 0,
        username,
        error: 'Workflow execution failed'
      });
    } else {
      // Fallback if workflow didn't return expected structure
      console.error('Workflow returned unexpected structure:', data);
      return NextResponse.json({
        success: true,
        frameworks: [],
        totalPosts: 0,
        username
      });
    }

  } catch (error) {
    console.error('Error analyzing Twitter user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
