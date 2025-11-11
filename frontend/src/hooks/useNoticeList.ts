import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import API from "@/lib/api";
import { Notice } from "@/types/notice";

type Params = Record<string, string | number | boolean | undefined>;

type UseNoticeListResult = {
  notices: Notice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const buildQueryString = (params?: Params): string => {
  if (!params) return "";
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const useNoticeList = (
  endpoint: string,
  params?: Params,
  autoFetch: boolean = true
): UseNoticeListResult => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString(params);
      const response = await API.get(`${endpoint}${queryString}`);

      const data =
        Array.isArray(response.data)
          ? response.data
          : response.data?.notices || [];

      setNotices(data);
    } catch (err: unknown) {
      console.error(`Error fetching notices from ${endpoint}:`, err);

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to load notices");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load notices");
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  useEffect(() => {
    if (autoFetch) {
      void fetchNotices();
    }
  }, [autoFetch, fetchNotices]);

  return {
    notices,
    loading,
    error,
    refetch: fetchNotices,
  };
};
