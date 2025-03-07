import type { AxiosRequestConfig } from 'axios';
import type { IMail, IMailLabel } from 'src/types/mail';

import { useMemo } from 'react';
import { keyBy } from 'es-toolkit';
import { useQuery } from '@tanstack/react-query';

import { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

// const swrOptions: SWRConfiguration = {
//   revalidateIfStale: false,
//   revalidateOnFocus: false,
//   revalidateOnReconnect: false,
// };

const queryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
};

// ----------------------------------------------------------------------

type AxiosURL = string | [string, AxiosRequestConfig];

// ----------------------------------------------------------------------

type LabelsData = {
  labels: IMailLabel[];
};

export function useGetLabels() {
  const url = endpoints.mail.labels;

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<LabelsData>({
    queryKey: ['labels'],
    queryFn: () => fetcher<LabelsData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      labels: data?.labels || [],
      labelsLoading: isLoading,
      labelsError: error,
      labelsValidating: isValidating,
      labelsEmpty: !isLoading && !isValidating && !data?.labels.length,
    }),
    [data?.labels, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type MailsData = {
  mails: IMail[];
};

export function useGetMails(labelId: string) {
  const url: AxiosURL = labelId ? [endpoints.mail.list, { params: { labelId } }] : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<MailsData>({
    queryKey: ['mails', labelId],
    queryFn: () => fetcher<MailsData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(() => {
    const byId = data?.mails.length ? keyBy(data?.mails, (option) => option.id) : {};
    const allIds = Object.keys(byId);

    return {
      mails: { byId, allIds },
      mailsLoading: isLoading,
      mailsError: error,
      mailsValidating: isValidating,
      mailsEmpty: !isLoading && !isValidating && !allIds.length,
    };
  }, [data?.mails, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

type MailData = {
  mail: IMail;
};

export function useGetMail(mailId: string) {
  const url: AxiosURL = mailId ? [endpoints.mail.details, { params: { mailId } }] : '';

  const {
    data,
    isLoading,
    error,
    isFetching: isValidating,
  } = useQuery<MailData>({
    queryKey: ['mail', mailId],
    queryFn: () => fetcher<MailData>(url),
    ...queryOptions,
  });

  const memoizedValue = useMemo(
    () => ({
      mail: data?.mail,
      mailLoading: isLoading,
      mailError: error,
      mailValidating: isValidating,
      mailEmpty: !isLoading && !isValidating && !data?.mail,
    }),
    [data?.mail, error, isLoading, isValidating]
  );

  return memoizedValue;
}
