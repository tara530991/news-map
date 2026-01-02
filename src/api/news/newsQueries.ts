import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  fetchTopHeadlines,
  fetchNewsByCountry,
  fetchNewsByCategory,
} from "./newsApi";
import { News } from "../../types/news";

type UseTopHeadlinesQuery<TData = News[]> = Partial<
  UseQueryOptions<News[], Error, TData>
>;

// Query Keys
export const newsKeys = {
  all: ["news"],
  topHeadlines: () => [...newsKeys.all, "top-headlines"],
  byCountry: (countryCode: string) => [
    ...newsKeys.all,
    "by-country",
    countryCode,
  ],
  byCategory: (category: string) => [...newsKeys.all, "by-category", category],
};

// Hooks
export const useTopHeadlinesQuery = <TData = News[]>(
  options?: UseTopHeadlinesQuery<TData>
) => {
  return useQuery<News[], Error, TData>({
    queryKey: newsKeys.topHeadlines(),
    queryFn: fetchTopHeadlines,
    ...options,
  });
};

export const useNewsByCountryQuery = (countryCode: string) => {
  return useQuery<News[], Error>({
    queryKey: newsKeys.byCountry(countryCode),
    queryFn: () => fetchNewsByCountry(countryCode),
    enabled: !!countryCode,
  });
};

export const useNewsByCategoryQuery = (category: string) => {
  return useQuery<News[], Error>({
    queryKey: newsKeys.byCategory(category),
    queryFn: () => fetchNewsByCategory(category),
    enabled: !!category,
  });
};
