import { useState, useCallback } from "react";
import NewsItem, { NewsItemSkeleton } from "../components/NewsItem";
import cn from "classnames";

import { News } from "../types/news";
import { useTopHeadlinesQuery } from "../api/news";
import Mapbox from "../components/Mapbox";

const MapPage = () => {
  const [selectedCountry, setCountry] = useState<{
    id: string;
    name: string;
  }>();
  const [activeNews, setActiveNews] = useState<News[]>();

  const handleMapClick = useCallback(
    (
      countryId: string | undefined,
      countryName: string | undefined,
      news: News[]
    ) => {
      if (countryId) {
        setCountry({ id: countryId, name: countryName || "" });
        setActiveNews(news);
      } else {
        setCountry(undefined);
        setActiveNews(undefined);
      }
    },
    []
  );

  const { data: newsList = [], isLoading, error } = useTopHeadlinesQuery();
  if (error) {
    return (
      <div className="text-center my-20">
        <p className="my-3 text-xl font-bold">Error</p>
        <p>{error.message}</p>
      </div>
    );
  }

  // newsList 中所有國家的 country codes，且去重複
  // const uniqueCountryCodes = useMemo(
  //   (): string[] => [...new Set(newsList.map((n: News) => n.countries).flat())],
  //   [newsList, error]
  // );

  // useFlagPreloader(uniqueCountryCodes);
  // const hasNewsGeoCountries = useHasNewsCountryGeo(
  //   newsList,
  //   uniqueCountryCodes
  // );

  return (
    <div className="relative">
      {/* Map */}
      <Mapbox newsList={newsList} onMapClick={handleMapClick} />

      {/* Left Sidebar */}
      <section
        className={cn(
          activeNews === undefined
            ? "flex justify-center items-center"
            : "flex flex-col",
          "w-80 h-svh absolute top-0 left-0 z-10 bg-white shadow-xl"
        )}
      >
        {selectedCountry && (
          <h3 className="m-4 text-center text-xl flex-shrink-0">
            {selectedCountry.name}
          </h3>
        )}
        <section className="flex-1 overflow-y-auto mx-4">
          {activeNews === undefined ? (
            <div className="text-gray-400 text-center">
              <p className="my-3 text-xl font-bold">News List</p>
              <p>Choose a country to display it's news</p>
            </div>
          ) : isLoading ? (
            // 顯示多個 skeleton 來模擬新聞列表
            Array.from({ length: 3 }).map((_, index) => (
              <NewsItemSkeleton key={index} />
            ))
          ) : (
            activeNews?.map((n) => <NewsItem key={n.id} news={n} />)
          )}
        </section>
      </section>
    </div>
  );
};

export default MapPage;
