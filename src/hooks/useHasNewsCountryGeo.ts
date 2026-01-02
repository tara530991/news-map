import { CustomFeature, CustomFeatureData } from "../types/geo";
import GeoCountryData from "../assets/data/countries.json";
import { transformAlpha3ToAlpha2 } from "../utils/countryCode";
import { News } from "../types/news";
import { useEffect, useState, useMemo } from "react";

export const useHasNewsCountryGeo = (
  newsList: News[],
  uniqueCountryCodes: string[]
): CustomFeature[] => {
  const [hasNewsGeoCountries, setNewsGeoCountries] = useState<CustomFeature[]>(
    []
  );

  // 使用 useMemo 來穩定 uniqueCountryCodes 的引用，避免每次渲染都創建新數組
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableCountryCodes = useMemo(() => {
    return uniqueCountryCodes;
    // 使用 join 來比較數組內容而非引用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueCountryCodes.join(",")]);

  useEffect(() => {
    if (newsList.length === 0) {
      setNewsGeoCountries([]);
      return;
    }

    const countryMap = new Map();
    const geoCountries: CustomFeatureData[] = GeoCountryData[0].data
      .allData as unknown as CustomFeatureData[];

    // 這裡取得的 countryCode 是 alpha2 代碼
    stableCountryCodes.forEach((countryCode) => {
      geoCountries.forEach((i) => {
        const alpha2Code = transformAlpha3ToAlpha2(i[0].properties.id);
        if (!alpha2Code || alpha2Code !== countryCode) return;

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

    const newCountries = [...countryMap.values()];
    // 只在內容真正改變時才更新狀態
    setNewsGeoCountries((prev) => {
      if (
        prev.length !== newCountries.length ||
        prev.some(
          (p, idx) =>
            !newCountries[idx] ||
            p.properties.id !== newCountries[idx].properties.id
        )
      ) {
        return newCountries;
      }
      return prev;
    });
  }, [newsList, stableCountryCodes]);

  return hasNewsGeoCountries;
};
