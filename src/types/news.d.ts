export interface News {
  id: string;
  title: string;
  publicTime: string;
  reporter: string;
  source: string;
  imageUrl: string;
  url: string;
  countries: string[];
}

export interface NewsAPIResponse {
  success: boolean;
  mockMode: boolean;
  count: number;
  data: string;
  originalUrl: string;
  timestamp: string;
}

export interface NewsAPIResponseData {
  totalArticles: number;
  articles: NewsAPIResponseDataArticle[];
}

export interface NewsAPIResponseDataArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
    country: string;
  };
}
