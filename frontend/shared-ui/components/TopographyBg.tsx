'use client'

interface TopographyBgProps {
  color?: string
  opacity?: number
  className?: string
}

export default function TopographyBg({
  color = 'white',
  opacity = 0.03,
  className = '',
}: TopographyBgProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity }}
      >
        <defs>
          <pattern
            id="topography-pattern"
            x="0"
            y="0"
            width="400"
            height="400"
            patternUnits="userSpaceOnUse"
          >
            {/* Topographic contour lines – evoke rural landscape */}
            <path
              d="M0 200 Q100 180 200 200 Q300 220 400 200"
              fill="none"
              stroke={color}
              strokeWidth="1"
            />
            <path
              d="M0 160 Q80 130 180 155 Q280 180 400 150"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
            />
            <path
              d="M0 240 Q120 260 220 240 Q320 220 400 250"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
            />
            <path
              d="M0 120 Q60 100 160 115 Q260 130 400 110"
              fill="none"
              stroke={color}
              strokeWidth="0.6"
            />
            <path
              d="M0 280 Q140 300 240 280 Q340 260 400 290"
              fill="none"
              stroke={color}
              strokeWidth="0.6"
            />
            <path
              d="M0 80 Q100 60 200 75 Q300 90 400 70"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
            />
            <path
              d="M0 320 Q80 340 200 325 Q320 310 400 330"
              fill="none"
              stroke={color}
              strokeWidth="0.5"
            />
            <path
              d="M0 40 Q120 25 220 40 Q320 55 400 35"
              fill="none"
              stroke={color}
              strokeWidth="0.4"
            />
            <path
              d="M0 360 Q100 375 200 360 Q300 345 400 370"
              fill="none"
              stroke={color}
              strokeWidth="0.4"
            />
            {/* Subtle dot grid – data points */}
            <circle cx="100" cy="100" r="1.5" fill={color} opacity="0.5" />
            <circle cx="300" cy="150" r="1.5" fill={color} opacity="0.5" />
            <circle cx="200" cy="300" r="1.5" fill={color} opacity="0.5" />
            <circle cx="350" cy="350" r="1" fill={color} opacity="0.3" />
            <circle cx="50" cy="350" r="1" fill={color} opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topography-pattern)" />
      </svg>
    </div>
  )
}
