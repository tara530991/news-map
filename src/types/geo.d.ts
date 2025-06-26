type CustomProperties = {
  name: string;
  id: string; // ISO3166 alpha3, length 3
  news?: News[];
};

export interface CustomFeature<
  G extends Geometry | null = Geometry,
  P = CustomProperties
> extends GeoJsonObject {
  type: "Feature";
  geometry: G;
  id?: string | number | undefined;
  properties: P;
}

export type CustomFeatureData = [CustomFeature, string, string];
