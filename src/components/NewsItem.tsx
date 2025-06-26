import { News } from "../types/news";
import { transformCodeToName } from "../utils/countryCode";

const NewsItem = ({ news }: { news: News }) => {
  console.log("news: ", news);
  return (
    <section key={news.id} className="mb-4">
      <div className="flex mb-1">
        <div className="shrink-0 flex justify-center items-center w-28 h-20 mr-2 rounded-sm bg-gray-300">
          <p className="text-xs text-gray-500">No Image</p>
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
            {news.public_time}
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
    </section>
  );
};

export default NewsItem;
