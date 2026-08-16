import type React from 'react'

interface GrainientProps {
  timeSpeed?: number
  colorBalance?: number
  warpStrength?: number
  warpFrequency?: number
  warpSpeed?: number
  warpAmplitude?: number
  blendAngle?: number
  blendSoftness?: number
  rotationAmount?: number
  noiseScale?: number
  grainAmount?: number
  grainScale?: number
  grainAnimated?: boolean
  contrast?: number
  gamma?: number
  saturation?: number
  centerX?: number
  centerY?: number
  zoom?: number
  color1?: string
  color2?: string
  color3?: string
  className?: string
}

// Lightweight fallback: replace heavy WebGL animation with a CSS gradient background.
export const Grainient: React.FC<GrainientProps & { animated?: boolean }> = ({
  className = '',
  animated = true,
  color1 = '#FF9FFC',
  color2 = '#5227FF',
  color3 = '#B497CF',
}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: `radial-gradient(1200px circle at 10% 20%, ${color1} 0%, transparent 30%), radial-gradient(1000px circle at 80% 80%, ${color2} 0%, transparent 35%), linear-gradient(180deg, ${color3} 0%, transparent 60%)`,
    mixBlendMode: 'screen',
    opacity: 0.9,
    transition: animated ? 'opacity 0.6s ease' : undefined,
  }

  return <div className={`${className}`} style={style} aria-hidden="true" />
}
