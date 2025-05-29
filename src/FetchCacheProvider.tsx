import React, { createContext, JSX, useContext, useRef } from "react";

type CacheMap = Map<string, any>;

const FetchCacheContext = createContext<CacheMap | null>(null);

export const FetchCacheProvider = ({ children }: any) => {
  const cacheRef = useRef<CacheMap>(new Map());
  return (
    // @ts-ignore
    <FetchCacheContext.Provider value={cacheRef.current}>
      {children}
    </FetchCacheContext.Provider>
  );
};

export const useFetchCache = () => useContext(FetchCacheContext);
