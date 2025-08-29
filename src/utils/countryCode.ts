import geoCountryCode from "../assets/data/geo_country_code.json";
import newsApiCountryCode from "../assets/data/news_api_country_codes.json";

export const getNewsApiCountryCode = () => {
  return newsApiCountryCode.map((c) => {
    return {
      code: c.code,
      name: c.name,
    };
  });
};

export const transformAlpha3ToAlpha2 = (code: string): string | undefined => {
  if (code.length < 3)
    throw `Code "${code}" length is wrong, should be or more than 3`;
  const country = geoCountryCode.find(
    (c) => c.alpha3 === code.toLocaleLowerCase()
  );
  if (country) {
    return country.alpha2;
  }
  return undefined;
};

export const transformAlpha2ToAlpha3 = (code: string): string | undefined => {
  if (code.length !== 2) throw `Code "${code}" length is wrong, should be 3`;

  const country = geoCountryCode.find(
    (c) => c.alpha2 === code.toLocaleLowerCase()
  );
  if (country) {
    return country.alpha3;
  }
};

export const transformCodeToName = (code: string): string => {
  if (code.length !== 2 && code.length !== 3) throw "code length is wrong";
  return code.length === 2
    ? geoCountryCode.filter((c) => c.alpha2 === code)[0].name
    : geoCountryCode.filter((c) => c.alpha3 === code)[0].name;
};
