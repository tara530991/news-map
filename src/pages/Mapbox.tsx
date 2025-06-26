import { useRef, useEffect, useState, useMemo } from "react";
import NewsItem from "../components/NewsItem";
import cn from "classnames";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import GeoCountryData from "../assets/data/countries.json";
// import { Geometry, GeoJsonObject } from "geojson";
import { calculateMultiPolygonCenter } from "../utils/calculate";
// import { fetchAllSources, fetchYesterdayNews } from "../utils/fetchNews";
// import PinImg from "assets/images/pin.png";
// import { fetchCNNNews } from "../utils/fetchNews";

// After import mapbox-gl/dist/mapbox-gl.css, the canvas height will be 0
// So you need to add extra css file to control the container of canvas
import "mapbox-gl/dist/mapbox-gl.css";
import "../css/mapbox.css"; // custom css
import { News } from "../types/news";
import { CustomFeature, CustomFeatureData } from "../types/geo";
import { fetchYesterdayNews } from "../utils/fetchNews";
import { transformAlpha3ToAlpha2 } from "../utils/countryCode";

const MAP_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_STYLE = import.meta.env.VITE_MAPBOX_ACCESS_STYLE;

const Mapbox = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const geoCountries: CustomFeatureData[] = GeoCountryData[0].data
    .allData as unknown as CustomFeatureData[];
  const [selectedCountry, setCountry] = useState<{
    id: string;
    name: string;
  }>();
  const [activeNews, setActiveNews] = useState<News[]>();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // let mapbox mark the highlight countries' list
  const hasNewsGeoCountries = useMemo((): CustomFeature[] => {
    const countryMap = new Map();
    if (newsList.length === 0) return [];

    newsList.forEach(({ countries }: { countries: string[] }) => {
      geoCountries
        // 找出 newsList 有哪些國家，並 geoCountries 取出將其轉換為 alpha2 代碼
        .filter((c) => {
          if (c[0].properties.id.length === 3) {
            const alpha2Code = transformAlpha3ToAlpha2(c[0].properties.id);
            const isMatch = alpha2Code && countries.includes(alpha2Code);

            return isMatch;
          }
          return false;
        })
        // 將同一國家的 geo data 集中在一起（本國國土與海外屬地或分割領土）
        .forEach((i) => {
          const alpha2Code = transformAlpha3ToAlpha2(i[0].properties.id);
          if (!alpha2Code) return;

          const news: News[] = newsList.filter((n) =>
            n.countries.some((c) => c === alpha2Code)
          );

          if (!countryMap.has(alpha2Code)) {
            i[0] = {
              ...i[0],
              properties: { ...i[0].properties, news },
            };
            countryMap.set(alpha2Code, i[0]);
          }
        });
    });
    console.log("Final countryMap: ", [...countryMap.values()]);

    return [...countryMap.values()];
  }, [newsList, geoCountries]);

  useEffect(() => {
    console.log("EFFECT hasNewsGeoCountries: ", hasNewsGeoCountries);
  }, [hasNewsGeoCountries]);

  // /**
  //  * Description placeholder
  //  *
  //  * @return {}
  //  */
  // const countryNewsMapping = useMemo((): { [countryCode: string]: News[] } => {
  //   return newsList.reduce(
  //     (acc: { [countryCode: string]: News[] }, n: News) => {
  //       const accCountries: string[] = Object.keys(acc);
  //       n.countries.forEach((c) => {
  //         if (accCountries.some((code) => code === c)) {
  //           acc[c].push(n);
  //         } else {
  //           acc[c] = [n];
  //         }
  //       });
  //       return acc;
  //     },
  //     {} as { [countryCode: string]: News[] }
  //   );
  // }, [newsList]);

  useEffect(() => {
    async function loadNews() {
      try {
        setIsLoading(true);
        setError(null);

        const news = await fetchYesterdayNews();
        setNewsList(news);
      } catch (error) {
        console.error("Error loading news:", error);
        setError("Failed to load news. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    loadNews();
  }, []);

  // initialize map
  useEffect(() => {
    if (!MAP_ACCESS_TOKEN) return;
    mapboxgl.accessToken = MAP_ACCESS_TOKEN;

    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: MAP_STYLE,
      center: [0, 0],
      zoom: 1.5,
      maxZoom: 6,
      minZoom: 1.5,
      attributionControl: false,
    });
  }, []);

  // 地圖上其他事件與樣式
  useEffect(() => {
    if (!map.current) return;
    const mapInstance = map.current;
    let hoveredPolygonId: string | number | undefined = undefined;

    mapInstance.on("load", () => {
      hasNewsGeoCountries.forEach((f) => {
        const countryId: string = f.properties.id;
        const countryName: string = f.properties.name;

        // add the data of will be highlight area
        mapInstance.addSource(countryName, {
          type: "geojson",
          generateId: true, // This ensures that all features have unique IDs
          data: f.geometry,
        });

        // add the highlight style
        mapInstance.addLayer({
          id: countryName,
          type: "fill",
          source: countryName,
          paint: {
            "fill-color": "#333",
            // 設定填充透明度
            // 使用 case 表達式根據滑鼠懸停狀態動態改變透明度
            // 當 feature-state 的 hover 為 true 時透明度為 0.6
            // 否則為預設透明度 0.3
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.6,
              0.3,
            ],
            "fill-antialias": true,
          },
        });

        function handleMapClick() {
          if (countryId) {
            setCountry({ id: countryId, name: countryName });
            setActiveNews(f.properties.news);
          } else {
            setCountry(undefined);
            setActiveNews(undefined);
          }
        }

        let marker: mapboxgl.Marker | null = null;
        if (f.geometry.type === "MultiPolygon") {
          const centerLngLat: [number, number] = calculateMultiPolygonCenter(
            f.geometry.coordinates
          );

          console.log("selectedCountry: ", f);

          const el = document.createElement("div");
          el.className = `py-1 px-2 bg-gray-700 rounded-md text-white`;
          el.textContent = countryName;
          marker = new mapboxgl.Marker(el);

          marker.setLngLat(centerLngLat).addTo(mapInstance);

          // 添加 popup 點擊事件監聽
          marker.getElement().addEventListener("click", () => {
            handleMapClick();
          });
        }

        mapInstance.on("click", countryName, () => {
          handleMapClick();
        });

        // 修改 mousemove 事件处理
        mapInstance.on("mousemove", countryName, (e) => {
          if (e.features && e.features.length > 0) {
            if (hoveredPolygonId !== undefined) {
              mapInstance.setFeatureState(
                { source: countryName, id: hoveredPolygonId },
                { hover: false }
              );
            }
            hoveredPolygonId = e.features[0].id;
            mapInstance.setFeatureState(
              { source: countryName, id: hoveredPolygonId },
              { hover: true }
            );
          }
        });

        // 修改 mouseleave 事件處理
        mapInstance.on("mouseleave", countryName, () => {
          if (hoveredPolygonId !== undefined) {
            mapInstance.setFeatureState(
              { source: countryName, id: hoveredPolygonId },
              { hover: false }
            );
            hoveredPolygonId = undefined;
          }
        });
      });
    });
  }, [hasNewsGeoCountries, selectedCountry]);

  return (
    <div className="relative">
      {/* Map */}
      <div ref={mapContainer} className="map-container" />

      {/* Left Sidebar */}
      <section
        className={cn(
          activeNews === undefined ? "flex justify-center items-center" : "",
          "w-80 h-svh p-4 absolute top-0 left-0 z-10 bg-white shadow-xl"
        )}
      >
        {selectedCountry && (
          <h3 className="mb-4 text-center text-xl">{selectedCountry.name}</h3>
        )}
        {isLoading ? (
          <div className="text-gray-400 text-center">
            <p className="my-3 text-xl font-bold">Loading News...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">
            <p className="my-3 text-xl font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : activeNews === undefined ? (
          <div className="text-gray-400 text-center">
            <p className="my-3 text-xl font-bold">News List</p>
            <p>Choose a country to display it's news</p>
          </div>
        ) : (
          activeNews?.map((n) => <NewsItem key={n.id} news={n} />)
        )}
      </section>
    </div>
  );
};

export default Mapbox;
