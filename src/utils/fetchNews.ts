import { News } from "../types/news";

const NEWS_API_BASE_URL = import.meta.env.VITE_NEWS_API_URL;
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const apiMode = import.meta.env.VITE_API_MODE;

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: {
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
  }[];
}

interface SourceAPIResponse {
  status: string;
  sources: Source[];
}

interface Source {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}

export async function fetchNewsByCountry(countryCode: string): Promise<News[]> {
  try {
    const params = new URLSearchParams();
    params.append("apiKey", NEWS_API_KEY);
    params.append("country", countryCode);
    params.append("language", "en");

    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?${params}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NewsAPIResponse = await response.json();

    return data.articles.map((article) => ({
      id: article.url, // 使用 URL 作為唯一標識符
      title: article.title,
      public_time: article.publishedAt,
      reporter: article.author || "Unknown",
      source: article.source.name,
      url: article.url,
      countries: [countryCode], // 添加國家代碼
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export async function fetchAllSources(): Promise<Source[]> {
  const response = await fetch(
    `${NEWS_API_BASE_URL}/top-headlines/sources?apiKey=${NEWS_API_KEY}`
  );
  const data: SourceAPIResponse = await response.json();
  return data.sources;
}

export async function fetchYesterdayNews(): Promise<News[]> {
  try {
    if (apiMode === "mock") {
      // 在 Vite 中，src/assets 下的文件需要透過 import 導入
      const mockData = await import("../assets/data/news_api_news.json");
      return mockData.default as News[];
    } else {
      // 獲取主要國家的新聞
      const countries = [
        "us",
        "gb",
        "cn",
        "jp",
        "kr",
        "in",
        "au",
        "ca",
        "de",
        "fr",
      ];
      const allNews: News[] = [];

      // 並行獲取所有國家的新聞
      const newsPromises = countries.map((country) =>
        fetchNewsByCountry(country)
      );
      const newsResults = await Promise.all(newsPromises);

      // 合併所有新聞
      newsResults.forEach((news) => {
        allNews.push(...news);
      });
      console.log("allNews: ", allNews);

      return allNews;
    }
  } catch (error) {
    console.error("Error fetching all news:", error);
    return [];
  }
}
