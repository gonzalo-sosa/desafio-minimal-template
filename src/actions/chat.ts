import type { AxiosRequestConfig } from 'axios';
import type { IChatMessage, IChatParticipant, IChatConversation } from 'src/types/chat';

import { useMemo } from 'react';
import { keyBy } from 'es-toolkit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios, { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const enableServer = false;

const CHART_ENDPOINT = endpoints.chat;

// TODO: añadir types de useQuery
const queryOptions = {
  refetchOnWindowFocus: enableServer,
  refetchOnMount: enableServer,
  refetchOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

type AxiosURL = string | [string, AxiosRequestConfig];

// ----------------------------------------------------------------------

type ContactsData = {
  contacts: IChatParticipant[];
};

export function useGetContacts() {
  const url: AxiosURL = [CHART_ENDPOINT, { params: { endpoint: 'contacts' } }];

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<ContactsData>({
    queryKey: ['contacts'],
    queryFn: () => fetcher<ContactsData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      contacts: data?.contacts || [],
      contactsLoading: isLoading,
      contactsError: error,
      contactsValidating: isValidating,
      contactsEmpty: !isLoading && !isValidating && !data?.contacts.length,
    }),
    [data?.contacts, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// #region useGetConversations

type ConversationsData = {
  conversations: IChatConversation[];
};

export function useGetConversations() {
  const url: AxiosURL = [CHART_ENDPOINT, { params: { endpoint: 'conversations' } }];

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<ConversationsData>({
    queryKey: ['conversations'],
    queryFn: () => fetcher<ConversationsData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(() => {
    const byId = data?.conversations.length ? keyBy(data.conversations, (option) => option.id) : {};
    const allIds = Object.keys(byId);

    return {
      conversations: { byId, allIds },
      conversationsLoading: isLoading,
      conversationsError: error,
      conversationsValidating: isValidating,
      conversationsEmpty: !isLoading && !isValidating && !allIds.length,
    };
  }, [data?.conversations, error, isLoading, isValidating]);

  return memoizedValue;
}

// #endregion

// #region useGetConversation

type ConversationData = {
  conversation: IChatConversation;
};

export function useGetConversation(conversationId: string) {
  const url: AxiosURL = conversationId
    ? [CHART_ENDPOINT, { params: { conversationId, endpoint: 'conversation' } }]
    : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<ConversationData>({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetcher<ConversationData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      conversation: data?.conversation,
      conversationLoading: isLoading,
      conversationError: error,
      conversationValidating: isValidating,
      conversationEmpty: !isLoading && !isValidating && !data?.conversation,
    }),
    [data?.conversation, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// #endregion

// #region useChatMutations

export function useChatMutations() {
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      messageData,
    }: {
      conversationId: string;
      messageData: IChatMessage;
    }) => {
      if (enableServer) {
        await axios.put(CHART_ENDPOINT, { conversationId, messageData });
      }
      return { conversationId, messageData };
    },
    onSuccess: ({ conversationId, messageData }) => {
      // Actualizar la conversación individual
      queryClient.setQueryData<ConversationData>(['conversation', conversationId], (old) => {
        if (!old)
          return {
            conversation: {
              id: conversationId,
              messages: [messageData],
              type: '',
              unreadCount: 0,
              participants: [],
            },
          };

        return {
          conversation: {
            ...old.conversation,
            messages: [...old.conversation.messages, messageData],
          },
        };
      });

      // Actualizar la lista de conversaciones
      queryClient.setQueryData<ConversationsData>(['conversations'], (old) => ({
        conversations:
          old?.conversations.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, messages: [...conversation.messages, messageData] }
              : conversation
          ) || [],
      }));
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (conversationData: IChatConversation) => {
      if (enableServer) {
        const res = await axios.post(CHART_ENDPOINT, { conversationData });
        return res.data;
      }
      return conversationData;
    },
    onSuccess: (newConversation) => {
      queryClient.setQueryData<ConversationsData>(['conversations'], (old) => ({
        conversations: [...(old?.conversations || []), newConversation],
      }));
    },
  });

  const clickConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      if (enableServer) {
        await axios.get(CHART_ENDPOINT, {
          params: { conversationId, endpoint: 'mark-as-seen' },
        });
      }
      return conversationId;
    },
    onSuccess: (conversationId) => {
      queryClient.setQueryData<ConversationsData>(['conversations'], (old) => ({
        conversations:
          old?.conversations.map((conversation) =>
            conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
          ) || [],
      }));
    },
  });

  return {
    sendMessage: sendMessageMutation.mutateAsync,
    createConversation: createConversationMutation.mutateAsync,
    clickConversation: clickConversationMutation.mutateAsync,
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingConversation: createConversationMutation.isPending,
    isClickingConversation: clickConversationMutation.isPending,
  };
}

// #endregion
