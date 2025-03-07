import type { AxiosRequestConfig } from 'axios';
import type { IProductItem } from 'src/types/product';

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

type ProductsData = {
  products: IProductItem[];
};

export function useGetProducts() {
  const url = endpoints.product.list;

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<ProductsData>({
    queryKey: ['products'],
    queryFn: () => fetcher<ProductsData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      products: data?.products || [],
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty: !isLoading && !isValidating && !data?.products.length,
    }),
    [data?.products, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type ProductData = {
  product: IProductItem;
};

export function useGetProduct(productId: string) {
  const url: AxiosURL = productId ? [endpoints.product.details, { params: { productId } }] : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<ProductData>({
    queryKey: ['product', productId],
    queryFn: () => fetcher<ProductData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      product: data?.product,
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type SearchResultsData = {
  results: IProductItem[];
};

export function useSearchProducts(query: string) {
  const url: AxiosURL = query ? [endpoints.product.search, { params: { query } }] : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<SearchResultsData>({
    queryKey: ['searchProductsResults', query],
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
