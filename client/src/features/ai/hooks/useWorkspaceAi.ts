import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { AIQueryResponse, AIChatMessage } from '../../../types/ai';
import { AuthApiResponse } from '../../../types/auth';

export const useWorkspaceAi = (workspaceId: string) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingText, setStreamingText] = useState<string>('');

  // 1. Query Health
  const aiHealthQuery = useQuery({
    queryKey: ['ai-health'],
    queryFn: () => apiClient.get('/ai/health'),
    staleTime: 60_000,
  });

  // 2. Query Providers
  const aiProvidersQuery = useQuery({
    queryKey: ['ai-providers'],
    queryFn: () => apiClient.get('/ai/providers'),
    staleTime: 300_000,
  });

  // 3. Post Query Mutation
  const sendQueryMutation = useMutation<
    AuthApiResponse<AIQueryResponse>,
    Error,
    { prompt: string; projectId?: string; taskId?: string }
  >({
    mutationFn: (data) =>
      apiClient.post<unknown, AuthApiResponse<AIQueryResponse>>('/ai/query', {
        prompt: data.prompt,
        workspaceId,
        projectId: data.projectId,
        taskId: data.taskId,
      }),
  });

  // 4. Execute Natural Language Query
  const askQuestion = useCallback(
    async (prompt: string, projectId?: string, taskId?: string) => {
      if (!prompt.trim() || !workspaceId) return;

      const userMessageId = `user_${Date.now()}`;
      const assistantMessageId = `assistant_${Date.now()}`;

      const userMessage: AIChatMessage = {
        id: userMessageId,
        role: 'user',
        content: prompt.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingText('');

      try {
        const res = await sendQueryMutation.mutateAsync({ prompt, projectId, taskId });

        if (res.success && res.data) {
          const assistantMessage: AIChatMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: res.data.response,
            timestamp: new Date().toISOString(),
            citations: res.data.citations,
            metrics: res.data.metrics,
          };

          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (err: any) {
        const errorMessage: AIChatMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: 'Sorry, an error occurred while processing your request.',
          timestamp: new Date().toISOString(),
          error: err?.message || 'Failed to communicate with AI platform',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsStreaming(false);
        setStreamingText('');
      }
    },
    [workspaceId, sendQueryMutation]
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setStreamingText('');
  }, []);

  return {
    messages,
    isStreaming,
    streamingText,
    askQuestion,
    clearConversation,
    aiHealthQuery,
    aiProvidersQuery,
    isLoading: sendQueryMutation.isPending,
  };
};
