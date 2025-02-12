import { Button } from "@/components/ui/button"

export function Sidebar() {
  const sports = [
    { name: "Football", icon: "⚽" },
    { name: "Basketball", icon: "🏀" },
    { name: "Tennis", icon: "🎾" },
    { name: "Hockey", icon: "🏒" },
  ]

  return (
    <div className="w-64 border-r h-[calc(100vh-4rem)] p-4">
      <div className="space-y-2">
        {sports.map((sport) => (
          <Button
            key={sport.name}
            variant="ghost"
            className="w-full justify-start"
          >
            <span className="mr-2">{sport.icon}</span>
            {sport.name}
          </Button>
        ))}
      </div>
    </div>
  )
} 