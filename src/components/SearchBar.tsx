'use client'

;
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { searchSofascore, SearchResult } from '@/lib/sofascore-api'
import Link from 'next/link'

const getItemLink = (item: SearchResult) => {
  switch (item.type) {
    case 'team':
      return `/team/${item.id}`
    case 'league':
      return `/league/${item.id}`
    case 'player':
      return `/player/${item.id}`
    default:
      return '#'
  }
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (query.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const searchResults = await searchSofascore(query)
        setResults(searchResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [query])

  const handleSelect = (result: SearchResult) => {
    setShowResults(false)
    setQuery('')
    
    // Debug log
    console.log('Navigating to:', result.type, result.id)
    
    // Use the correct path based on the result type
    const path = `/${result.type}/${result.id}`
    console.log('Path:', path)
    
    router.push(path)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search teams, players, leagues..."
          className="w-full rounded-md border pl-9 pr-4 py-2 text-sm"
        />
      </div>

      {showResults && (query.length > 0 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-[400px] overflow-auto z-50">
          {loading ? (
            <div className="p-2 text-sm text-muted-foreground">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">No results found</div>
          ) : (
            results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-2 p-2 hover:bg-accent text-left"
              >
                {item.crest && (
                  <img 
                    src={item.crest} 
                    alt="" 
                    className="w-5 h-5"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm">{item.name}</span>
                  {item.country && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {item.country.flag && (
                        <img 
                          src={item.country.flag} 
                          alt="" 
                          className="w-3 h-3"
                        />
                      )}
                      {item.country.name}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
} 