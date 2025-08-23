import {
  News,
  NewsAPIResponse,
  NewsAPIResponseData,
  NewsAPIResponseDataArticle,
} from "../types/news";

const NEWS_API_BASE_URL = import.meta.env.VITE_NEWS_API;

export async function fetchTopHeadlines(): Promise<News[]> {
  try {
    const params = new URLSearchParams();

    params.append("category", "general");
    params.append("language", "en");
    params.append("country", "tw,us,jp,gb,de,fr,ca,au,sg,br,nl");
    params.append(
      "from",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );
    params.append("to", new Date().toISOString());

    const response = await fetch(
      `${NEWS_API_BASE_URL}/top-headlines?${params}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NewsAPIResponse = await response.json();
    const newsData: NewsAPIResponseData = JSON.parse(data.data);

    if (data.success && newsData) {
      return newsData.articles.map((article: NewsAPIResponseDataArticle) => ({
        id: article.url,
        title: article.title,
        publicTime: article.publishedAt,
        reporter: "Unknown",
        source: article.source.name,
        imageUrl: article.image,
        url: article.url,
        countries: [article.source.country],
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}
