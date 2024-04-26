import { useRef, useEffect, useState, useMemo } from "react";
import NewsItem from "../components/NewsItem";
import cn from "classnames";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import GeoCountryData from "../assets/countries.json";
import { Geometry, GeoJsonObject } from "geojson";
import NewsData from "../assets/mock-news.json";
import { calculateMultiPolygonCenter } from "../utils/calculate";

// After import mapbox-gl/dist/mapbox-gl.css, the canvas height will be 0
// So you need to add extra css file to control the container of canvas
import "mapbox-gl/dist/mapbox-gl.css";
import "../css/mapbox.css"; // custom css

type CustomProperties = {
  name: string;
  id: string; // ISO3166 alpha3, length 3
  news?: News[];
};
interface CustomFeature<
  G extends Geometry | null = Geometry,
  P = CustomProperties
> extends GeoJsonObject {
  type: "Feature";
  geometry: G;
  id?: string | number | undefined;
  properties: P;
}
export type CustomFeatureData = [CustomFeature, string, string];
export interface News {
  id: string;
  title: string;
  public_time: string;
  reporter: string;
  source: string;
  url: string;
  countries: string[];
}

const Mapbox = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const geoCountries: CustomFeatureData[] = GeoCountryData[0].data
    .allData as unknown as CustomFeatureData[];
  const [selectedCountry, setCountry] = useState<string>();
  const [activeNews, setActiveNews] = useState<News[]>();

  const newsList: News[] = NewsData as unknown[] as News[];

  // let mapbox mark the highlight countries' list
  const hasNewsGeoCountries = useMemo((): CustomFeature[] => {
    const countryMap = new Map();
    newsList.forEach(({ countries }: { countries: string[] }) => {
      geoCountries
        .filter((c) => countries.includes(c[0].properties.id))
        .forEach((i) => {
          const newsCountryId = i[0].properties.id;
          const news: News[] = newsList
            .map((n) => {
              if (n.countries.some((c) => c === newsCountryId)) {
                return n;
              }
            })
            .filter((n) => n) as News[];
          if (!countryMap.get(countryMap.get(newsCountryId))) {
            i[0] = {
              ...i[0],
              properties: { ...i[0].properties, news },
            };
            countryMap.set(newsCountryId, i[0]);
          }
        });
    });
    return [...countryMap.values()];
  }, [newsList, geoCountries]);

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

  mapboxgl.accessToken =
    "pk.eyJ1IjoidGFyYTUzMDk5MSIsImEiOiJjbHQ1am00aXQwMXA1MmtwZGN5Y2hwb2RwIn0.HMJLTyEcK6uWT5uN7CUoTA";

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: "mapbox://styles/tara530991/clu0vasea021s01o8bkq8cxl3",
      center: [0, 0],
      zoom: 1.5,
      maxZoom: 6,
      minZoom: 1.5,
      attributionControl: false,
    });

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
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              0.6,
              0.3,
            ],
          },
        });

        if (f.geometry.type === "MultiPolygon") {
          const centerLngLat: [number, number] = calculateMultiPolygonCenter(
            f.geometry.coordinates
          );

          // const popup = new mapboxgl.Popup({
          //   closeOnClick: false,
          //   closeButton: false,
          // });
          // popup
          //   .setLngLat(centerLngLat)
          //   .setText(countryNewsMapping[countryId].length.toString())
          //   .setMaxWidth("30px")
          //   .addTo(mapInstance);
        }

        mapInstance.on("click", countryName, () => {
          console.log(countryId);
          if (countryId) {
            setCountry(countryId);
            setActiveNews(f.properties.news);
          } else {
            setCountry(undefined);
            setActiveNews(undefined);
          }
        });

        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        mapInstance.on("mousemove", countryName, () => {
          if (hoveredPolygonId !== undefined) {
            mapInstance.setFeatureState(
              { source: countryName, id: hoveredPolygonId },
              { hover: false }
            );
          }
          hoveredPolygonId = countryId || "";
          mapInstance.setFeatureState(
            { source: countryName, id: hoveredPolygonId },
            { hover: true }
          );
        });

        mapInstance.on("mouseleave", countryName, () => {
          if (hoveredPolygonId !== undefined) {
            mapInstance.setFeatureState(
              { source: countryName, id: hoveredPolygonId },
              { hover: false }
            );
          }
          hoveredPolygonId = undefined;
        });
      });
    });
  });

  return (
    <div className="relative">
      <div ref={mapContainer} className="map-container" />
      <section
        className={cn(
          activeNews === undefined ? "flex justify-center items-center" : "",
          "w-80 h-svh p-4 absolute top-0 left-0 z-10 bg-white shadow-xl"
        )}
      >
        {activeNews === undefined ? (
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
