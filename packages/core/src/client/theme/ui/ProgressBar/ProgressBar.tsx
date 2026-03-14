import React, { useEffect, useState } from "react";
import "./ProgressBar.css";

export function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let container: Element | null = null;
    let timer: any;

    const handleScroll = () => {
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight <= clientHeight) {
        setProgress(0);
        return;
      }
      const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    const attachListener = () => {
      container = document.querySelector(".boltdocs-content");
      if (container) {
        container.addEventListener("scroll", handleScroll);
        handleScroll();
        if (timer) clearInterval(timer);
        return true;
      }
      return false;
    };

    if (!attachListener()) {
      timer = setInterval(attachListener, 100);
    }

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div className="boltdocs-progress-container">
      <div 
        className="boltdocs-progress-bar" 
        style={{ width: `${progress}%` }} 
      />
    </div>
  );
}
