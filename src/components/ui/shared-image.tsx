'use client'

interface SharedImageProps {
  type: 'team' | 'player' | 'league' | 'country'
  id: number | string
  className?: string
  alt: string
}

export function SharedImage({ type, id, className, alt }: SharedImageProps) {
  const getImageUrl = () => {
    switch (type) {
      case 'team':
      case 'player':
        return `https://api.sofascore.com/api/v1/${type}/${id}/image`
      case 'league':
        return `https://api.sofascore.com/api/v1/unique-tournament/${id}/image`
      case 'country':
        return `https://flagcdn.com/${id.toString().toLowerCase()}.svg`
      default:
        return ''
    }
  }

  return (
    <img 
      src={getImageUrl()}
      alt={alt}
      className={className}
    />
  )
} 