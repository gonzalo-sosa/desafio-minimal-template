import type { IPostItem } from 'src/types/blog';
import type { AxiosRequestConfig } from 'axios';

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

type PostsData = {
  posts: IPostItem[];
};

export function useGetPosts() {
  const url = endpoints.post.list;

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<PostsData, Error>({
    queryKey: ['posts'],
    queryFn: () => fetcher<PostsData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      posts: data?.posts || [],
      postsLoading: isLoading,
      postsError: error,
      postsValidating: isValidating,
      postsEmpty: !isLoading && !data?.posts.length,
    }),
    [data?.posts, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type PostData = {
  post: IPostItem;
};

export function useGetPost(title: string) {
  const url: AxiosURL = title ? [endpoints.post.details, { params: { title } }] : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<PostData, Error>({
    queryKey: ['post', title],
    queryFn: () => fetcher<PostData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      post: data?.post,
      postLoading: isLoading,
      postError: error,
      postValidating: isValidating,
    }),
    [data?.post, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type LatestPostsData = {
  latestPosts: IPostItem[];
};

export function useGetLatestPosts(title: string) {
  const url: AxiosURL = title ? [endpoints.post.latest, { params: { title } }] : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<LatestPostsData, Error>({
    queryKey: ['latestPosts', title],
    queryFn: () => fetcher<LatestPostsData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      latestPosts: data?.latestPosts || [],
      latestPostsLoading: isLoading,
      latestPostsError: error,
      latestPostsValidating: isValidating,
      latestPostsEmpty: !isLoading && !data?.latestPosts.length,
    }),
    [data?.latestPosts, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type SearchResultsData = {
  results: IPostItem[];
};

export function useSearchPosts(query: string) {
  const url: AxiosURL = query ? [endpoints.post.search, { params: { query } }] : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<SearchResultsData, Error>({
    queryKey: ['searchPostsResults', query],
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
