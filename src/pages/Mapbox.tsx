import { useRef, useEffect, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import GeoCountryData from "../assets/countries.json";
import { Geometry, GeoJsonObject } from "geojson";

// After import mapbox-gl/dist/mapbox-gl.css, the canvas height will be 0
// So you need to add extra css file to control the container of canvas
import "mapbox-gl/dist/mapbox-gl.css";
import "../css/mapbox.css"; // custom css

type CustomProperties = {
  name: string;
  id: string;
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
type CustomFeatureData = [CustomFeature, string, string];

const Mapbox = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const geoCountry: CustomFeatureData[] = GeoCountryData[0].data
    .allData as unknown as CustomFeatureData[];
  const [selectedCountry, setCountry] = useState<string>("");

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
      geoCountry.forEach((item) => {
        const f: CustomFeature = item[0];
        const countryId: string = f.properties.id;
        const countryName: string = f.properties.name;

        mapInstance.addSource(countryName, {
          type: "geojson",
          generateId: true, // This ensures that all features have unique IDs
          data: f.geometry,
        });
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
        // When the user moves their mouse over the state-fill layer, we'll update the
        // feature state for the feature under the mouse.
        mapInstance.on("mousemove", countryName, () => {
          setCountry(`${countryId} ${countryName}`);

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
          setCountry("");
        });
      });
    });
  });

  return (
    <div>
      <p className="absolute top-1/2 left-1/2 z-50 text-4xl">
        {selectedCountry}
      </p>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Mapbox;
