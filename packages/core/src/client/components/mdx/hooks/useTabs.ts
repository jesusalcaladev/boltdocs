import { useState, useRef, useEffect, useCallback, ReactElement, KeyboardEvent } from "react";

interface UseTabsProps {
  initialIndex?: number;
  tabs: ReactElement<any>[];
}

export function useTabs({ initialIndex = 0, tabs }: UseTabsProps) {
  const defaultActive = tabs[initialIndex]?.props.disabled 
    ? tabs.findIndex((t) => !t.props.disabled) 
    : initialIndex;

  const [active, setActive] = useState(defaultActive === -1 ? 0 : defaultActive);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({
    opacity: 0,
    transform: "translateX(0)",
    width: 0,
  });

  useEffect(() => {
    const activeTab = tabRefs.current[active];
    if (activeTab) {
      setIndicatorStyle({
        opacity: 1,
        width: activeTab.offsetWidth,
        transform: `translateX(${activeTab.offsetLeft}px)`,
      });
    }
  }, [active, tabs]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    let direction = 0;
    if (e.key === "ArrowRight") direction = 1;
    else if (e.key === "ArrowLeft") direction = -1;

    if (direction !== 0) {
      let nextIndex = (active + direction + tabs.length) % tabs.length;
      while (tabs[nextIndex].props.disabled && nextIndex !== active) {
        nextIndex = (nextIndex + direction + tabs.length) % tabs.length;
      }

      if (nextIndex !== active && !tabs[nextIndex].props.disabled) {
        setActive(nextIndex);
        tabRefs.current[nextIndex]?.focus();
      }
    }
  }, [active, tabs]);

  return {
    active,
    setActive,
    tabRefs,
    indicatorStyle,
    handleKeyDown,
  };
}


