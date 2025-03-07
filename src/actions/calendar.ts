import type { ICalendarEvent } from 'src/types/calendar';

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import axios, { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const enableServer = false;

const CALENDAR_ENDPOINT = endpoints.calendar;

// TODO: añadir types de useQuery
const queryOptions = {
  refetchOnWindowFocus: enableServer,
  refetchOnMount: enableServer,
  refetchOnReconnect: enableServer,
};

// #region getEvents

type EventsData = {
  events: ICalendarEvent[];
};

export function useGetEvents() {
  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<EventsData>({
    queryKey: ['events'],
    queryFn: () => fetcher<EventsData>(CALENDAR_ENDPOINT),
    ...queryOptions,
  });

  const memoizedValue = useMemo(() => {
    const events = data?.events.map((event) => ({ ...event, textColor: event.color }));

    return {
      events: events || [],
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
      eventsEmpty: !isLoading && !isValidating && !data?.events.length,
    };
  }, [data?.events, error, isLoading, isValidating]);

  return memoizedValue;
}

// #endregion

// #region useMutations

export function useEventMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (eventData: ICalendarEvent) => {
      if (enableServer) {
        await axios.post(CALENDAR_ENDPOINT, { eventData });
      }
      return eventData;
    },
    onSuccess: (eventData) => {
      queryClient.setQueryData<EventsData>(['events'], (old) => ({
        events: [...(old?.events || []), eventData],
      }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (eventData: Partial<ICalendarEvent>) => {
      if (enableServer) {
        await axios.put(CALENDAR_ENDPOINT, { eventData });
      }
      return eventData;
    },
    onSuccess: (eventData) => {
      queryClient.setQueryData<EventsData>(['events'], (old) => ({
        events:
          old?.events.map((event) =>
            event.id === eventData.id ? { ...event, ...eventData } : event
          ) || [],
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (enableServer) {
        await axios.patch(CALENDAR_ENDPOINT, { eventId });
      }
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.setQueryData<EventsData>(['events'], (old) => ({
        events: old?.events.filter((event) => event.id !== eventId) || [],
      }));
    },
  });

  return {
    createEvent: createMutation.mutateAsync,
    updateEvent: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
