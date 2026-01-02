import { useRef, useEffect, useMemo } from "react";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import { calculateMultiPolygonCenter } from "../utils/calculate";

import "mapbox-gl/dist/mapbox-gl.css";
import "../css/mapbox.css"; // custom css
import { News } from "../types/news";
import { useHasNewsCountryGeo } from "../hooks/useHasNewsCountryGeo";
import { useFlagPreloader } from "../hooks/useFlagPreloader";

const MAP_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_STYLE = import.meta.env.VITE_MAPBOX_ACCESS_STYLE;

const Mapbox = ({
  newsList,
  onMapClick,
}: {
  newsList: News[];
  onMapClick: (countryId: string, countryName: string, news: News[]) => void;
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);

  // newsList 中所有國家的 country codes，且去重複
  const uniqueCountryCodes = useMemo(
    (): string[] => [...new Set(newsList.flatMap((n: News) => n.countries))],
    [newsList]
  );

  useFlagPreloader(uniqueCountryCodes);
  const hasNewsGeoCountries = useHasNewsCountryGeo(
    newsList,
    uniqueCountryCodes
  );

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
      minZoom: 2,
      attributionControl: false,
      // 添加邊界限制，防止拖拽超出地圖範圍
      // maxBounds: [
      //   [-180, -40], // 西南角
      //   [180, 40], // 東北角
      // ],
    });
  }, []);

  // 地圖上其他事件與樣式
  useEffect(() => {
    if (!map.current || hasNewsGeoCountries.length === 0) return;
    const mapInstance = map.current;
    let hoveredPolygonId: string | number | undefined = undefined;
    const markers: mapboxgl.Marker[] = [];
    const clickHandlers: Array<{ layer: string; handler: () => void }> = [];
    const mousemoveHandlers: Array<{
      layer: string;
      handler: (e: mapboxgl.MapLayerMouseEvent) => void;
    }> = [];
    const mouseleaveHandlers: Array<{ layer: string; handler: () => void }> =
      [];
    let loadHandler: (() => void) | null = null;

    // 清理舊的事件監聽器和圖層
    const cleanup = () => {
      // 移除所有標記
      markers.forEach((marker) => marker.remove());
      markers.length = 0;

      // 移除所有事件監聽器
      clickHandlers.forEach(({ layer, handler }) => {
        mapInstance.off("click", layer, handler);
      });
      clickHandlers.length = 0;

      mousemoveHandlers.forEach(({ layer, handler }) => {
        mapInstance.off("mousemove", layer, handler);
      });
      mousemoveHandlers.length = 0;

      mouseleaveHandlers.forEach(({ layer, handler }) => {
        mapInstance.off("mouseleave", layer, handler);
      });
      mouseleaveHandlers.length = 0;

      if (loadHandler) {
        mapInstance.off("load", loadHandler);
        loadHandler = null;
      }

      // 移除所有圖層和數據源
      hasNewsGeoCountries.forEach((f) => {
        const countryName = f.properties.name;
        if (mapInstance.getLayer(countryName)) {
          mapInstance.removeLayer(countryName);
        }
        if (mapInstance.getSource(countryName)) {
          mapInstance.removeSource(countryName);
        }
      });
    };

    // 清理舊的圖層和事件
    cleanup();

    const addLayers = () => {
      hasNewsGeoCountries.forEach((f) => {
        const countryId: string = f.properties.id;
        const countryName: string = f.properties.name;

        // add the data of will be highlight area
        if (!mapInstance.getLayer(countryName)) {
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
              // 設定顏色透明度
              // 使用 case 表達式根據滑鼠移過狀態動態改變透明度
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
        }

        let marker: mapboxgl.Marker | null = null;
        if (f.geometry.type === "MultiPolygon") {
          const centerLngLat: [number, number] = calculateMultiPolygonCenter(
            f.geometry.coordinates
          );

          const el = document.createElement("div");
          el.className = `py-1 px-2 bg-gray-700 rounded-md text-white`;
          el.textContent = countryName;
          marker = new mapboxgl.Marker(el);

          marker.setLngLat(centerLngLat).addTo(mapInstance);
          markers.push(marker);

          // 添加 popup 點擊事件監聽
          const markerClickHandler = () => {
            onMapClick(countryId, countryName, f.properties.news || []);
          };
          marker.getElement().addEventListener("click", markerClickHandler);
        }

        const clickHandler = () => {
          onMapClick(countryId, countryName, f.properties.news || []);
        };
        mapInstance.on("click", countryName, clickHandler);
        clickHandlers.push({ layer: countryName, handler: clickHandler });

        // 修改 mousemove 事件处理
        const mousemoveHandler = (e: mapboxgl.MapLayerMouseEvent) => {
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
        };
        mapInstance.on("mousemove", countryName, mousemoveHandler);
        mousemoveHandlers.push({
          layer: countryName,
          handler: mousemoveHandler,
        });

        // 修改 mouseleave 事件處理
        const mouseleaveHandler = () => {
          if (hoveredPolygonId !== undefined) {
            mapInstance.setFeatureState(
              { source: countryName, id: hoveredPolygonId },
              { hover: false }
            );
            hoveredPolygonId = undefined;
          }
        };
        mapInstance.on("mouseleave", countryName, mouseleaveHandler);
        mouseleaveHandlers.push({
          layer: countryName,
          handler: mouseleaveHandler,
        });
      });
    };

    if (mapInstance.isStyleLoaded()) {
      addLayers();
    } else {
      loadHandler = () => {
        addLayers();
      };
      mapInstance.on("load", loadHandler);
    }

    return cleanup;
  }, [hasNewsGeoCountries, onMapClick]);

  return <section ref={mapContainer} className="map-container" />;
};

export default Mapbox;
