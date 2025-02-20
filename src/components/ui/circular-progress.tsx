interface CircularProgressProps {
  value: number
  size?: "sm" | "md" | "lg"
  color: string
}

export function CircularProgress({ 
  value, 
  size = "md",
  color 
}: CircularProgressProps) {
  const radius = size === "sm" ? 18 : size === "md" ? 24 : 30
  const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 5
  const circumference = 2 * Math.PI * radius
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        style={{ width: radius * 2.5, height: radius * 2.5 }}
      >
        <circle
          className="text-muted/20"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        <circle
          className="transition-all duration-300 ease-in-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (value / 100) * circumference}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      <span style={{ color }} className="absolute text-sm font-medium">
        {value}%
      </span>
    </div>
  )
} 