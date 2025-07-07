import { useEffect, useState } from "react"

type Ping = {
  id: string
  x: number
  y: number
}

const Radar = () => {
  const [pings, setPings] = useState<Ping[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const angle = Math.random() * 2 * Math.PI
      const radius = Math.random() * 40 // keep inside radar radius

      const x = 40 + radius * Math.cos(angle)
      const y = 40 + radius * Math.sin(angle)

      const newPing: Ping = {
        id: crypto.randomUUID(),
        x,
        y,
      }

      setPings((prev) => [...prev, newPing])

      // Remove ping after 2s
      setTimeout(() => {
        setPings((prev) => prev.filter((p) => p.id !== newPing.id))
      }, 4000)
    }, 1000) // spawn every 0.8s

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-40 min-h-40">
      {/* Static SVG Radar Base */}
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <rect width="1024" height="1024" rx="64" fill="#121217" />
        <circle
          cx="511.8"
          cy="511.8"
          r="428.4"
          fill="#141142"
          stroke="#4143C7"
          strokeWidth="10.8"
        />
        <circle
          cx="511.8"
          cy="511.8"
          r="307.836"
          fill="#141142"
          stroke="#4143C7"
          strokeWidth="9"
        />
        <circle
          cx="511.8"
          cy="511.799"
          r="185.39"
          fill="#141142"
          stroke="#4143C7"
          strokeWidth="5.42011"
        />
        <line
          x1="91.5"
          y1="509.1"
          x2="932.1"
          y2="509.1"
          stroke="#4143C7"
          strokeWidth="5.4"
        />
        <line
          x1="212.693"
          y1="807.088"
          x2="807.087"
          y2="212.694"
          stroke="#4143C7"
          strokeWidth="5.4"
        />
        <line
          x1="216.512"
          y1="212.694"
          x2="810.906"
          y2="807.088"
          stroke="#4143C7"
          strokeWidth="5.4"
        />
        <line
          x1="514.5"
          y1="91.5"
          x2="514.5"
          y2="932.1"
          stroke="#4143C7"
          strokeWidth="5.4"
        />
      </svg>

      {/* Sweep effect */}
      <div className="absolute top-0 left-0 w-full h-full rounded-full animate-spin-slow pointer-events-none [mask-image:radial-gradient(circle_at_center,black_90%,transparent_100%)] [background:conic-gradient(rgba(64,67,186,0.4)_0deg,rgba(64,67,186,0.1)_30deg,transparent_60deg,transparent_360deg)]" />

      {/* Pings */}
      {pings.map((ping) => (
        <div
          key={ping.id}
          className="absolute w-1.5 h-1.5 bg-indigo-300 rounded-full animate-ping"
          style={{
            left: `${ping.x}px`,
            top: `${ping.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  )
}

export default Radar
