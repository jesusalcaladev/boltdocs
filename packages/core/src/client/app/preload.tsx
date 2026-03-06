import React, { createContext, useContext, useCallback } from "react";
import { ComponentRoute } from "./index";

interface PreloadContextType {
  preload: (path: string) => void;
}

const PreloadContext = createContext<PreloadContextType>({
  preload: () => {},
});

export function usePreload() {
  return useContext(PreloadContext);
}

export function PreloadProvider({
  routes,
  modules,
  children,
}: {
  routes: ComponentRoute[];
  modules: Record<string, () => Promise<any>>;
  children: React.ReactNode;
}) {
  const preload = useCallback(
    (path: string) => {
      // Normalize path (remove hash and search)
      const cleanPath = path.split("#")[0].split("?")[0];

      // Support index routes matching "/"
      const route = routes.find(
        (r) => r.path === cleanPath || (cleanPath === "/" && r.path === ""),
      );

      if (route && route.filePath) {
        const loaderKey = Object.keys(modules).find((k) =>
          k.endsWith("/" + route.filePath),
        );

        if (loaderKey) {
          // Trigger the dynamic import
          modules[loaderKey]().catch((err: any) => {
            console.error(`[boltdocs] Failed to preload route ${path}:`, err);
          });
        }
      }
    },
    [routes, modules],
  );

  return (
    <PreloadContext.Provider value={{ preload }}>
      {children}
    </PreloadContext.Provider>
  );
}
