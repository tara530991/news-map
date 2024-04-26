import countryCode from "../assets/geo-country-code-ISO3166.json";

export const transformCode3ToCode2 = (code: string): string => {
  if (code.length !== 3) throw "code length is wrong";
  return countryCode.filter((c) => c.code3 === code)[0].code2;
};

export const transformCode2ToCode3 = (code: string): string => {
  if (code.length !== 2) throw "code length is wrong";
  return countryCode.filter((c) => c.code2 === code)[0].code3;
};

export const transformCodToName = (code: string): string => {
  if (code.length !== 2 && code.length !== 3) throw "code length is wrong";
  return code.length === 2
    ? countryCode.filter((c) => c.code2 === code)[0].name
    : countryCode.filter((c) => c.code3 === code)[0].name;
};
