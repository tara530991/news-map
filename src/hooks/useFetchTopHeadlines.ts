import { useState, useEffect, useCallback } from "react";
import { fetchTopHeadlines } from "../utils/fetchNews";
import { News } from "../types/news";

export const useFetchTopHeadlines = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const news = await fetchTopHeadlines();
      console.log("news: ", news);

      setNewsList(news);
    } catch (error) {
      console.error("Error loading news:", error);
      setError("Failed to load news. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 只在組件掛載時執行一次
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return { newsList, isLoading, error, refetch: fetchNews };
};
