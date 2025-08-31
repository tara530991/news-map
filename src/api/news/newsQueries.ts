import { useQuery } from "@tanstack/react-query";
import {
  fetchTopHeadlines,
  fetchNewsByCountry,
  fetchNewsByCategory,
} from "./newsApi";
import { News } from "../../types/news";

// Query Keys
export const newsKeys = {
  all: ["news"] as const,
  topHeadlines: () => [...newsKeys.all, "top-headlines"] as const,
  byCountry: (countryCode: string) =>
    [...newsKeys.all, "by-country", countryCode] as const,
  byCategory: (category: string) =>
    [...newsKeys.all, "by-category", category] as const,
};

// Hooks
export const useTopHeadlinesQuery = () => {
  return useQuery<News[], Error>({
    queryKey: newsKeys.topHeadlines(),
    queryFn: fetchTopHeadlines,
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
