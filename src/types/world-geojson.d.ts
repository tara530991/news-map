declare module "world-geojson" {
  function forCountry(countryName: string): any;
  function forState(countryName: string, areaName: string): any;
  function forArea(countryName: string, areaName: string): any;
  export { forCountry, forState, forArea };
}
