import React from "react";
import "./Benchmark.css";

const BENCHMARK_DATA = [
  {
    name: "Boltdocs",
    version: "warm",
    time: 13.78,
    color: "var(--ld-color-primary)",
  },
  {
    name: "Boltdocs",
    version: "cold",
    time: 25.69,
    color: "var(--ld-color-primary)",
  },
  {
    name: "Nextra",
    version: "v3",
    time: 368.92,
    color: "var(--ld-color-primary-muted)",
  },
];

export function Benchmark() {
  const maxTime = Math.max(...BENCHMARK_DATA.map((d) => d.time));

  return (
    <div className="benchmark-container">
      <h2 className="benchmark-title">Benchmark</h2>
      {BENCHMARK_DATA.map((item, index) => {
        // Calculate the width percentage relative to the max time.
        // We set a minimum width of 5% so very small bars are still visible.
        const widthPercent = Math.max((item.time / maxTime) * 100, 5);

        return (
          <div key={index} className="benchmark-row">
            <div className="benchmark-label">
              <strong>{item.name}</strong>
              {item.version && <small>{item.version}</small>}
            </div>

            <div className="benchmark-bar-wrapper">
              <div
                className="benchmark-bar"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: item.color,
                  // Stagger the animation slightly for each row
                  animationDelay: `${index * 0.15}s`,
                }}
              />
            </div>

            <div className="benchmark-value">{item.time.toFixed(2)} s</div>
          </div>
        );
      })}
    </div>
  );
}
