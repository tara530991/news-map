import { useState } from "react";
import { transformCodeToName } from "../utils/countryCode";

interface CountryFlagProps {
  countryCode: string;
  size?: number;
  className?: string;
}

const CountryFlag = ({
  countryCode,
  size = 24,
  className = "",
}: CountryFlagProps) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  // 使用更快的圖片服務
  const flagUrl = `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-xs text-gray-500 ${className}`}
        style={{ width: size, height: size }}
        title={`${transformCodeToName(countryCode)} (Failed to load)`}
      >
        {countryCode}
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={flagUrl}
        alt={countryCode}
        title={transformCodeToName(countryCode)}
        className={className}
        style={{ width: size, height: size }}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};

export default CountryFlag;
