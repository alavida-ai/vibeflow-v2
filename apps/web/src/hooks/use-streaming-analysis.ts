import { useState } from 'react';
import { AnalysisHistory } from '@/types/dashboard';

export const useStreamingAnalysis = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState<string | null>(null);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);

    const processStreamEvent = (
        event: any,
        currentAnalysis: AnalysisHistory | null,
        setCurrentAnalysis: (updater: (prev: AnalysisHistory | null) => AnalysisHistory | null) => void,
        setAnalysisHistory: (updater: (prev: AnalysisHistory[]) => AnalysisHistory[]) => void
    ) => {
        try {
            console.log('Stream event:', event);

            // Handle different event types based on Mastra documentation
            if (event.type === 'workflow-step-result') {
                const stepName = event.payload?.stepName || event.payload?.id;

                // Mark step as completed
                setCompletedSteps(prev => [...prev, stepName]);

                // Handle the final step (calculate-metrics) which contains the complete result
                if (stepName === 'calculate-metrics' && event.payload?.output?.frameworks) {
                    const result = event.payload.output;
                    setCurrentAnalysis(prev => {
                        if (!prev) return prev;
                        const finalAnalysis = {
                            ...prev,
                            frameworks: result.frameworks || [],
                            totalPosts: result.totalPosts || prev.totalPosts
                        };

                        // Update in history
                        setAnalysisHistory(prevHistory =>
                            prevHistory.map(analysis =>
                                analysis.id === prev.id ? finalAnalysis : analysis
                            )
                        );

                        return finalAnalysis;
                    });
                    console.log('Final frameworks received from calculate-metrics step:', result);
                } else {
                    // Handle other step results for debugging
                    console.log(`Step ${stepName} completed:`, event.payload?.output);
                }
            } else if (event.type === 'workflow-finish') {
                console.log('Workflow completed with usage:', event.payload?.usage);
                // workflow-finish contains usage stats, not the actual result
                setCurrentStep(null);
            } else if (event.type === 'workflow-step-start') {
                const stepName = event.payload?.stepName || event.payload?.id || 'Unknown step';
                console.log('Step started:', stepName);
                setCurrentStep(stepName);
            } else if (event.type === 'workflow-start') {
                console.log('Workflow started with runId:', event.runId);
                setCurrentStep('starting');
                setCompletedSteps([]);
            }
        } catch (error) {
            console.error('Error processing stream event:', error);
        }
    };

    const startAnalysis = async (
        username: string,
        currentAnalysis: AnalysisHistory | null,
        setCurrentAnalysis: (updater: (prev: AnalysisHistory | null) => AnalysisHistory | null) => void,
        setAnalysisHistory: (updater: (prev: AnalysisHistory[]) => AnalysisHistory[]) => void
    ) => {
        setIsLoading(true);
        setCurrentStep(null);
        setCompletedSteps([]);

        try {
            // Call the streaming analysis API
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData.error || 'Failed to analyze user');
                throw new Error(errorData.error || 'Failed to analyze user');
            }

            if (!response.body) {
                throw new Error('No response body received');
            }

            // Process the streaming response using the correct Mastra approach
            try {
                // Use the approach similar to Mastra's client-side processing
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                try {
                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            console.log('Stream complete');
                            // Process any remaining data in buffer
                            if (buffer.trim()) {
                                const chunks = buffer.split('\x1E').filter(chunk => chunk.trim());
                                for (const chunk of chunks) {
                                    try {
                                        const event = JSON.parse(chunk);
                                        processStreamEvent(event, currentAnalysis, setCurrentAnalysis, setAnalysisHistory);
                                    } catch (parseError) {
                                        console.warn('Failed to parse remaining buffer chunk:', chunk.substring(0, 100) + '...', parseError instanceof Error ? parseError.message : String(parseError));
                                    }
                                }
                            }
                            break;
                        }

                        try {
                            // Decode chunk and add to buffer
                            const chunk = decoder.decode(value, { stream: true });
                            buffer += chunk;

                            // Split by Record Separator (\x1E) as per Mastra SDK
                            const parts = buffer.split('\x1E');

                            // Keep the last part in buffer (might be incomplete)
                            buffer = parts.pop() || '';

                            // Process complete parts
                            for (const part of parts) {
                                const trimmedPart = part.trim();
                                if (trimmedPart) {
                                    try {
                                        const event = JSON.parse(trimmedPart);
                                        processStreamEvent(event, currentAnalysis, setCurrentAnalysis, setAnalysisHistory);
                                    } catch (parseError) {
                                        console.warn('Failed to parse JSON chunk:', {
                                            chunk: trimmedPart.substring(0, 100) + (trimmedPart.length > 100 ? '...' : ''),
                                            error: parseError instanceof Error ? parseError.message : String(parseError),
                                            bufferLength: buffer.length
                                        });
                                        // Continue processing other chunks instead of breaking
                                    }
                                }
                            }
                        } catch (chunkError) {
                            console.error('Error processing chunk:', chunkError);
                            // Continue reading instead of breaking the entire stream
                        }
                    }
                } finally {
                    reader.releaseLock();
                }
            } catch (streamError) {
                console.error('Stream processing error:', streamError);
                throw streamError;
            }

        } catch (error) {
            console.error('Error in streaming analysis:', error);
            // Keep the analysis entry but mark it as failed
            setCurrentAnalysis(prev => prev ? { ...prev, frameworks: [] } : prev);
            throw error;
        } finally {
            setIsLoading(false);
            setCurrentStep(null);
        }
    };

    return {
        isLoading,
        currentStep,
        completedSteps,
        startAnalysis
    };
};
