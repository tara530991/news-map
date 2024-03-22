import { useRef, useEffect } from "react";
import mapboxgl, { Map } from "mapbox-gl";

// After import mapbox-gl/dist/mapbox-gl.css, the canvas height will be 0
// So you need to add extra css file to control the container of canvas
import "mapbox-gl/dist/mapbox-gl.css";
import "../css/mapbox.css"; // custom css

const Mapbox = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  mapboxgl.accessToken =
    "pk.eyJ1IjoidGFyYTUzMDk5MSIsImEiOiJjbHQ1am00aXQwMXA1MmtwZGN5Y2hwb2RwIn0.HMJLTyEcK6uWT5uN7CUoTA";

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current || "",
      style: "mapbox://styles/tara530991/clu0vasea021s01o8bkq8cxl3",
      center: [0, 0],
      zoom: 1.5,
      maxZoom: 5,
      minZoom: 1.5,
      attributionControl: false,
    });
  });

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Mapbox;
