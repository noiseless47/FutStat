'use client'

interface FormProps {
  form: string[];
  avgRating?: string;
  position?: number;
}

export function TeamForm({ form, avgRating, position }: FormProps) {
  return (
    <div className="flex items-center gap-6 p-4 bg-white dark:bg-gray-900">
      <div className="flex gap-1">
        {form.map((result, i) => (
          <div 
            key={i}
            className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white
              ${result === 'W' ? 'bg-green-500' : ''}
              ${result === 'D' ? 'bg-yellow-500' : ''}
              ${result === 'L' ? 'bg-red-500' : ''}
            `}
          >
            {result}
          </div>
        ))}
      </div>
      
      {avgRating && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Avg Rating</span>
          <span className="font-medium">{avgRating}</span>
        </div>
      )}
      
      {position && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Position</span>
          <span className="font-medium">#{position}</span>
        </div>
      )}
    </div>
  )
} 