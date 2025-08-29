import { CustomFeature, CustomFeatureData } from "../types/geo";
import GeoCountryData from "../assets/data/countries.json";
import { transformAlpha3ToAlpha2 } from "../utils/countryCode";
import { News } from "../types/news";
import { useEffect, useState } from "react";

export const useHasNewsCountryGeo = (
  newsList: News[],
  uniqueCountryCodes: string[]
): CustomFeature[] => {
  const [hasNewsGeoCountries, setNewsGeoCountries] = useState<CustomFeature[]>(
    []
  );

  useEffect(() => {
    if (newsList.length === 0) {
      setNewsGeoCountries([]);
      return;
    }

    const countryMap = new Map();
    const geoCountries: CustomFeatureData[] = GeoCountryData[0].data
      .allData as unknown as CustomFeatureData[];

    // 這裡取得的 countryCode 是 alpha2 代碼
    uniqueCountryCodes.forEach((countryCode) => {
      geoCountries.forEach((i) => {
        const alpha2Code = transformAlpha3ToAlpha2(i[0].properties.id);
        if (!alpha2Code || alpha2Code !== countryCode) {
          console.log(
            "Country code cannot mapping, geo data's alpha2Code: ",
            alpha2Code,
            " , countryCode from fetch data: ",
            countryCode
          );
          return;
        }

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

    setNewsGeoCountries([...countryMap.values()]);
  }, [newsList, uniqueCountryCodes]);

  return hasNewsGeoCountries;
};
