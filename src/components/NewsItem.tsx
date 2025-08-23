import { News } from "../types/news";
import { transformCodeToName } from "../utils/countryCode";

const NewsItem = ({ news }: { news: News }) => {
  return (
    <div key={news.id} className="mb-4">
      <div className="flex mb-1">
        <div className="shrink-0 relative w-28 h-20 mr-2 rounded-sm bg-gray-300 overflow-hidden">
          {/* 斜角標籤 */}
          <div className="absolute top-0 left-0 w-0 h-0 border-l-[40px] border-l-cyan-600 border-b-[40px] border-b-transparent z-10"></div>
          <div
            className="absolute top-1 left-0 text-white text-xs font-medium z-20 max-w-[35px] truncate rotate-[-45deg]"
            title={news.source}
          >
            {news.source}
          </div>

          {news.imageUrl ? (
            <img
              src={news.imageUrl}
              alt="news image"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex justify-center items-center w-full h-full">
              <p className="text-xs text-gray-500">No Image</p>
            </div>
          )}
        </div>
        <div className="grow flex flex-wrap flex-col justify-between">
          <div>
            {news.countries.map((c, i) => {
              if (i < 3) {
                return (
                  <img
                    key={c}
                    src={`https://flagsapi.com/${c.toLocaleUpperCase()}/flat/32.png`}
                    alt={c}
                    title={transformCodeToName(c)}
                    className="inline-block ml-1"
                  />
                );
              }
            })}
          </div>
          <div className="text-sm text-gray-600" title="Public time">
            {news.publicTime}
          </div>
        </div>
      </div>

      <a
        href={news.url}
        target="_blank"
        title="Click me to visit news's website"
      >
        <h4 className="line-clamp-2 hover:underline hover:underline-offset-2 hover:decoration-2 hover:decoration-cyan-950 hover:text-cyan-950">
          {news.title}
        </h4>
      </a>
    </div>
  );
};

export default NewsItem;
