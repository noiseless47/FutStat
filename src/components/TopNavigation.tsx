'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import { Moon, Sun } from 'lucide-react'
import { SearchBar } from './SearchBar'

export function TopNavigation() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="FutStat Logo" 
              width={32} 
              height={32} 
            />
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FutStat
            </span>
          </Link>
          
          <div className="w-72">
            <SearchBar />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  )
} 