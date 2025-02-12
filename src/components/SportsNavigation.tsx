'use client'

import Link from 'next/link'
import { IoFootballOutline } from "react-icons/io5"
import { GiCricketBat, GiShuttlecock, GiBoxingGlove, GiPoolEightBall } from "react-icons/gi"
import { MdSportsBasketball, MdSportsTennis, MdSportsRugby, MdSportsVolleyball } from "react-icons/md"
import { FaTableTennis } from "react-icons/fa"
import { PiMotorcycleFill } from "react-icons/pi"
import { BiSolidCategoryAlt } from "react-icons/bi"
import { RiBilliardsFill } from "react-icons/ri"

const SPORTS = [
  { name: 'Football', icon: IoFootballOutline, count: 105, href: '/' },
  { name: 'Cricket', icon: GiCricketBat, count: 2, href: '/cricket' },
  { name: 'Badminton', icon: GiShuttlecock, href: '/badminton' },
  { name: 'Tennis', icon: MdSportsTennis, count: 55, href: '/tennis' },
  { name: 'Rugby', icon: MdSportsRugby, href: '/rugby' },
  { name: 'MMA', icon: GiBoxingGlove, href: '/mma' },
  { name: 'Motorsport', icon: PiMotorcycleFill, count: 5, href: '/motorsport' },
  { name: 'Basketball', icon: MdSportsBasketball, count: 6, href: '/basketball' },
  { name: 'Volleyball', icon: MdSportsVolleyball, href: '/volleyball' },
  { name: 'Snooker', icon: RiBilliardsFill, href: '/snooker' },
  { name: 'Table Tennis', icon: FaTableTennis, count: 9, href: '/table-tennis' },
  { name: 'More', icon: BiSolidCategoryAlt, href: '/more' }
]

export function SportsNavigation() {
  return (
    <nav className="border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="container overflow-x-auto">
        <div className="flex items-center h-10 space-x-6">
          {SPORTS.map((sport) => (
            <Link
              key={sport.name}
              href={sport.href}
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap"
            >
              {sport.icon && <sport.icon className="w-4 h-4" />}
              <span className="text-xs font-medium">{sport.name}</span>
              {sport.count && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {sport.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
} 