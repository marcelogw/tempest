'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface YearSelectorProps {
  currentYear: string
  availableYears: string[]
  onYearChange: (year: string) => void
}

export function YearSelector({ currentYear, availableYears, onYearChange }: YearSelectorProps) {
  const changeYear = (direction: 'prev' | 'next') => {
    const year = parseInt(currentYear)
    const newYear = direction === 'next' ? year + 1 : year - 1
    onYearChange(newYear.toString())
  }

  return (
    <div className="flex items-center gap-2" data-testid="year-selector">
      <Button
        variant="outline"
        size="icon"
        onClick={() => changeYear('prev')}
        className="h-8 w-8 bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Select value={currentYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-[120px] h-8">
          <Calendar className="h-4 w-4 mr-1" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={() => changeYear('next')}
        className="h-8 w-8 bg-transparent"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
