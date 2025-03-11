import type { AxiosRequestConfig } from 'axios';
import type { IFlightItem } from 'src/types/flight';

import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

import { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

// const swrOptions: SWRConfiguration = {
//   revalidateIfStale: false,
//   revalidateOnFocus: false,
//   revalidateOnReconnect: false,
// };

// TODO: añadir types de useQuery
const queryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
};

// ----------------------------------------------------------------------

type AxiosURL = string | [string, AxiosRequestConfig];

// ----------------------------------------------------------------------

type FlightsData = {
  flights: IFlightItem[];
};

export function useGetFlights() {
  const url = endpoints.flight.list;

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<FlightsData>({
    queryKey: ['flights'],
    queryFn: () => fetcher<FlightsData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      flights: data?.flights || [],
      flightsLoading: isLoading,
      flightsError: error,
      flightsValidating: isValidating,
      flightsEmpty: !isLoading && !isValidating && !data?.flights.length,
    }),
    [data?.flights, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type FlightData = {
  flight: IFlightItem;
};

export function useGetFlight(flightId: string) {
  const url: AxiosURL = flightId ? [endpoints.flight.details, { params: { flightId } }] : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<FlightData>({
    queryKey: ['flight', flightId],
    queryFn: () => fetcher<FlightData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      flight: data?.flight,
      flightLoading: isLoading,
      flightError: error,
      flightValidating: isValidating,
    }),
    [data?.flight, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type SearchResultsData = {
  results: IFlightItem[];
};

export function useSearchFlights(query: string) {
  const url: AxiosURL = query ? [endpoints.flight.search, { params: { query } }] : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<SearchResultsData>({
    queryKey: ['searchFlightsResults', query],
    queryFn: () => fetcher<SearchResultsData>(url),
    placeholderData: keepPreviousData,
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}
