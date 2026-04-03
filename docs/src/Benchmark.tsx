import React, { useRef } from 'react'
import './Benchmark.css'
import { Rocket } from 'lucide-react'

const BENCHMARK_DATA = [
  {
    name: 'Boltdocs',
    version: 'warm',
    time: 13.78,
    color: 'var(--ld-warning-color)',
  },
  {
    name: 'Boltdocs',
    version: 'cold',
    time: 25.69,
    color: 'var(--ld-cold-color)',
  },
  {
    name: 'Nextra',
    version: 'v3',
    time: 368.92,
    color: 'var(--ld-color-primary-muted)',
  },
]

export function Benchmark() {
  const containerRef = useRef<HTMLDivElement>(null)
  const maxTime = Math.max(...BENCHMARK_DATA.map((d) => d.time))

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { clientX, clientY } = e
    const { left, top } = containerRef.current.getBoundingClientRect()
    containerRef.current.style.setProperty('--mouse-x', `${clientX - left}px`)
    containerRef.current.style.setProperty('--mouse-y', `${clientY - top}px`)
  }

  return (
    <div
      className="benchmark-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      <h2 className="benchmark-title">
        <Rocket />
        Benchmark
      </h2>
      {BENCHMARK_DATA.map((item, index) => {
        const widthPercent = Math.max((item.time / maxTime) * 100, 5)

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
                  animationDelay: `${index * 0.15}s`,
                }}
              />
            </div>

            <div className="benchmark-value">{item.time.toFixed(2)}s</div>
          </div>
        )
      })}
    </div>
  )
}
