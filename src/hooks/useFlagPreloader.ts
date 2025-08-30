import { useCallback, useEffect, useState } from "react";

export const useFlagPreloader = (countryCodes: string[]) => {
  const [loadedFlags, setLoadedFlags] = useState<Set<string>>(new Set());

  const preloadFlags = useCallback(async () => {
    const newLoadedFlags = new Set<string>();

    const loadPromises = countryCodes.map(async (code) => {
      try {
        const img = new Image();
        img.src = `https://flagcdn.com/${code.toLowerCase()}.svg`;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          // 設置超時
          setTimeout(reject, 3000);
        });

        newLoadedFlags.add(code);
      } catch (error) {
        console.warn(`Failed to preload flag for ${code}:`, error);
      }
    });

    await Promise.allSettled(loadPromises);
    setLoadedFlags(newLoadedFlags);
  }, [countryCodes]);

  useEffect(() => {
    if (countryCodes.length > 0) {
      preloadFlags();
    }
  }, [preloadFlags, countryCodes]);

  return Array.from(loadedFlags);
};
