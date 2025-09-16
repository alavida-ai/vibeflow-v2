import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const WORKFLOW_CREATE_RUN_URL = process.env.WORKFLOW_CREATE_RUN_URL;
    const WORKFLOW_STREAM_URL = process.env.WORKFLOW_STREAM_URL;
    
    if (!WORKFLOW_CREATE_RUN_URL || !WORKFLOW_STREAM_URL) {
      throw new Error('WORKFLOW_CREATE_RUN_URL and WORKFLOW_STREAM_URL must be set');
    }

    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Call the Mastra Twitter framework analysis workflow
    // First create a workflow run
    const createRunResponse = await fetch(WORKFLOW_CREATE_RUN_URL, {
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

    const response = await fetch(`${WORKFLOW_STREAM_URL}?runId=${runId}`, {
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

    // Return the stream directly to the client
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error analyzing Twitter user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}